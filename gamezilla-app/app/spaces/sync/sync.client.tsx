import { addProfiles, sendToServer } from "gamezilla-app/app/@/client";
import { SpaceClientModule } from "../architecture/architecture";
import { Space, Spaces } from "../spaces-core";

const update: SpaceClientModule["update"] = (input) => {
	return SpaceClientModule.andThen(
		{ model: input.model },
		(model) => updateProfiles({ ...input, model }),
		(model) => updateSync({ ...input, model }),
		(model) => sendSpaceEventToServer({ ...input, model }),
		(model) => outputSpaceEventsFromServer({ ...input, model }),
	);
};

const outputSpaceEventsFromServer: SpaceClientModule["update"] = (input) => {
	const { model, msgServer } = input;

	switch (msgServer?.t) {
		case "event": {
			return {
				model,
				msgSpaceEvent: [msgServer.c],
			};
		}
	}

	return { model };
};

const sendSpaceEventToServer: SpaceClientModule["update"] = ({
	ctx,
	model,
	msgSpaceEvent,
}) => {
	if (!msgSpaceEvent) {
		return { model };
	}

	const spaceEventWithMeta = Spaces.toEventWithMeta(
		model,
		msgSpaceEvent.spaceId,
		msgSpaceEvent.eventId,
	);

	if (!spaceEventWithMeta) {
		return { model };
	}

	const profile =
		"userId" in spaceEventWithMeta
			? ctx.profiles[spaceEventWithMeta.userId]
			: null;

	const profiles = profile ? { [profile.userId]: profile } : {};

	return {
		model,
		msgCmd: [sendToServer({ t: "event", c: spaceEventWithMeta, profiles })],
	};
};

const updateProfiles: SpaceClientModule["update"] = ({ model, msgServer }) => {
	if (msgServer?.profiles) {
		return {
			model,
			msgCmd: [addProfiles(msgServer.profiles)],
		};
	}

	return { model };
};

const updateSync: SpaceClientModule["update"] = (input) => {
	const { model, msgEvt, msgServer } = input;

	switch (msgEvt?.t) {
		case "wire/server-connected": {
			const currentUserId = input.ctx.currentUserId;

			if (!currentUserId) {
				return { model };
			}

			const currentUserProfile = currentUserId
				? input.ctx.profiles[currentUserId]
				: null;

			const currentUserSpace = Spaces.toSpaceByUserId({
				model,
				userId: currentUserId,
			});

			if (!currentUserSpace) {
				return { model };
			}

			const started = Space.startFromLatestSnapshot(currentUserSpace);

			return {
				model: {
					...model,
					isSyncing: true,
				},
				msgCmd: [
					sendToServer({
						t: "sync",
						space: started,
						profiles: currentUserProfile
							? { [currentUserId]: currentUserProfile }
							: {},
						causedBy: msgEvt.t,
					}),
				],
			};
		}
	}

	switch (msgServer?.t) {
		case "synced":
		case "current-user-space": {
			const merged = Spaces.mergeOne({ model, space: msgServer.space });
			return {
				model: { ...model, ...merged },
			};
		}
	}

	return { model };
};

export const SyncClient = {
	update,
};
