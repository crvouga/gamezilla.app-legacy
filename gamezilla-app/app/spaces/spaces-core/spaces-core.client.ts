import { SpaceId, UserId } from "gamezilla-app/app/@/data";
import { EventId, type WithEventId } from "../@/event";
import * as SpaceState from "./space-core-state";
import * as Space from "./space-core";
import type { SpaceCoreEvent } from "./space-core-event";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
//
//
//

export const SpaceError = p.obj({
	t: p.l("user-already-in-a-space"),
	userId: UserId,
});
export type SpaceError = p.Infer<typeof SpaceError>;

export const Model = p.obj({
	spaces: p.dict(SpaceId, Space.Model),
	spaceIdByUserId: p.dict(UserId, SpaceId),
	errors: p.dict(EventId, SpaceError),
});
export type Model = p.Infer<typeof Model>;

export const init: Model = {
	spaces: {},
	spaceIdByUserId: {},
	errors: {},
};

//
//
//
//
//
//

export const listSpaces = ({
	model,
	limit,
	offset,
	where,
}: {
	model: Model;
	limit: number;
	offset: number;
	where?: {
		spaceId?: SpaceId;
	};
	sort?: "newest" | "oldest";
}): Space.Model[] => {
	if (where?.spaceId) {
		const space = model.spaces[where.spaceId];

		if (!space) {
			return [];
		}

		return [space];
	}

	const spaces: Space.Model[] = [];

	let i = -1;
	for (const spaceId in model.spaces) {
		i += 1;

		if (i < offset) {
			continue;
		}

		const spaceModel = model.spaces[spaceId as SpaceId];

		if (!spaceModel) {
			continue;
		}

		const spaceState = Space.deriveState(spaceModel);

		switch (spaceState.type) {
			case "ended": {
				break;
			}
			case "initial": {
				break;
			}
			case "started": {
				const started = Space.startFromLatestSnapshot(spaceModel);
				spaces.push(started);
				break;
			}
		}

		if (spaces.length >= limit) {
			break;
		}
	}

	return spaces;
};

export const toSpaceIdByUserId = (
	model: Model,
	userId: UserId | null | undefined,
): SpaceId | null => {
	return userId ? model.spaceIdByUserId[userId] ?? null : null;
};

export const toSpace = (model: Model, spaceId: SpaceId): Space.Model | null => {
	return model.spaces[spaceId] ?? null;
};

export const toErrorByEvenId = (
	model: Model,
	eventId: EventId,
): SpaceError | null => {
	return model.errors[eventId] ?? null;
};

export const hasEvent = (
	model: Model,
	spaceId: SpaceId,
	eventId: EventId,
): boolean => {
	const space = toSpace(model, spaceId);
	return Boolean(space && Space.hasEvent(space, eventId));
};

export const toSpaceByUserId = ({
	model,
	userId,
}: {
	model: Model;
	userId: UserId;
}): Space.Model | null => {
	const spaceId = model.spaceIdByUserId[userId];

	if (!spaceId) {
		return null;
	}

	const space = model.spaces[spaceId];

	if (!space) {
		return null;
	}

	return space;
};

export const toEventWithMeta = (
	model: Model,
	spaceId: SpaceId,
	msgEvtId: EventId,
) => {
	const space = model.spaces[spaceId];

	if (!space) {
		return null;
	}

	return Space.toEventWithMeta(space, msgEvtId);
};

export const toSpaceState = (
	model: Model,
	spaceId?: SpaceId | null | undefined,
): SpaceState.State => {
	if (!spaceId) {
		return SpaceState.init;
	}

	const spaceModel = model.spaces[spaceId];

	if (!spaceModel) {
		return SpaceState.init;
	}

	const spaceState = Space.deriveState(spaceModel);

	return spaceState;
};

export const toSpaceStarted = (
	model: Model,
	spaceId?: SpaceId | null,
): SpaceState.Started | null => {
	if (!spaceId) {
		return null;
	}

	const spaceModel = model.spaces[spaceId];

	if (!spaceModel) {
		return null;
	}

	const spaceState = Space.toSpaceStarted(spaceModel);

	return spaceState;
};

//
//
//
//
//
//

type UpdateError = "space-not-found" | "already-in-space";

export const updateFromSpaceEvent = ({
	model,
	spaceEvent,
}: {
	model: Model;
	spaceEvent: WithEventId<SpaceCoreEvent>;
}): {
	model: Model;
	err?: UpdateError;
} => {
	switch (spaceEvent.t) {
		case "game": {
			return appendEvent({ model, msgEvt: spaceEvent });
		}

		case "user-inputted-game": {
			return appendEvent({ model, msgEvt: spaceEvent });
		}

		case "user-ended-space": {
			const userIds = Space.toUserIds(
				model.spaces[spaceEvent.spaceId] ?? Space.init,
			);

			const spaceIdByUserIdNew = { ...model.spaceIdByUserId };
			for (const userId of userIds) {
				delete spaceIdByUserIdNew[userId];
			}

			const appended = appendEvent({ model, msgEvt: spaceEvent });

			return {
				model: {
					...appended.model,
					spaceIdByUserId: spaceIdByUserIdNew,
				},
			};
		}

		case "user-joined-space": {
			const spaceId = model.spaceIdByUserId[spaceEvent.userId];

			if (spaceId) {
				return {
					model: {
						...model,
						errors: {
							...model.errors,
							[spaceEvent.eventId]: {
								t: "user-already-in-a-space",
								userId: spaceEvent.userId,
							},
						},
					},
				};
			}

			const spaceIdByUserIdNew = {
				...model.spaceIdByUserId,
				[spaceEvent.userId]: spaceEvent.spaceId,
			};

			const appended = appendEvent({ model, msgEvt: spaceEvent });

			return {
				model: {
					...appended.model,
					spaceIdByUserId: spaceIdByUserIdNew,
				},
			};
		}

		case "user-left-space": {
			const spaceIdByUserIdNew = { ...model.spaceIdByUserId };

			if (spaceEvent.spaceId === model.spaceIdByUserId[spaceEvent.userId]) {
				delete spaceIdByUserIdNew[spaceEvent.userId];
			}

			const appended = appendEvent({ model, msgEvt: spaceEvent });

			return {
				model: {
					...appended.model,
					spaceIdByUserId: spaceIdByUserIdNew,
				},
			};
		}

		case "user-started-space": {
			const spaceIdByUserIdNew = {
				...model.spaceIdByUserId,
				[spaceEvent.userId]: spaceEvent.spaceId,
			};

			const appended = appendEvent({ model, msgEvt: spaceEvent });

			return {
				model: {
					...appended.model,
					spaceIdByUserId: spaceIdByUserIdNew,
				},
			};
		}
	}
};

const appendEvent = ({
	model,
	msgEvt,
}: {
	model: Model;
	msgEvt: WithEventId<SpaceCoreEvent>;
}): {
	model: Model;
} => {
	const spaceId = msgEvt.spaceId;

	const space = model.spaces[spaceId] ?? Space.init;

	const spaceNew = Space.appendEvent({ event: msgEvt, model: space });

	return {
		model: {
			...model,
			spaces: {
				...model.spaces,
				[spaceId]: spaceNew,
			},
		},
	};
};

export const mergeMany = ({
	model,
	spaces,
}: {
	model: Model;
	spaces: Space.Model[];
}): Model => {
	return spaces.reduce(
		(modelNew, space) => mergeOne({ model: modelNew, space }),
		model,
	);
};

export const mergeOne = ({
	model,
	space,
}: {
	model: Model;
	space: Space.Model;
}): Model => {
	const spaceState = Space.toSpaceStarted(space);

	if (!spaceState) {
		return model;
	}

	const currentSpace = model.spaces[spaceState.spaceId];

	if (!currentSpace) {
		const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
			model.spaceIdByUserId,
			space,
		);

		return {
			...model,
			spaces: {
				...model.spaces,
				[spaceState.spaceId]: space,
			},
			spaceIdByUserId: spaceIdByUserIdNew,
		};
	}

	const spaceNew = Space.mergeLeft(space, currentSpace);

	const spaceIdByUserIdNew = updateSpaceIdByUserIdFromSpaceState(
		model.spaceIdByUserId,
		spaceNew,
	);

	return {
		...model,
		spaces: {
			...model.spaces,
			[spaceState.spaceId]: spaceNew,
		},
		spaceIdByUserId: spaceIdByUserIdNew,
	};
};

const updateSpaceIdByUserIdFromSpaceState = (
	spaceIdByUserId: Model["spaceIdByUserId"],
	space: Space.Model,
): Model["spaceIdByUserId"] => {
	const spaceState = Space.toSpaceStarted(space);

	if (!spaceState) {
		return spaceIdByUserId;
	}

	const spaceIdByUserIdNew = { ...spaceIdByUserId };

	spaceIdByUserIdNew[spaceState.hostId] = spaceState.spaceId;

	for (const userId of SpaceState.toUserIds(spaceState)) {
		spaceIdByUserIdNew[userId] = spaceState.spaceId;
	}

	return spaceIdByUserIdNew;
};
