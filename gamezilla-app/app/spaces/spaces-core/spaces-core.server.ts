import { Result } from "gamezilla-app/@/core";
import type { SpaceId, UserId } from "gamezilla-app/app/@/data";
import type { IDbConnKv } from "gamezilla-app/app/@/server/db-conn-kv";
import type { EventId, WithEventId } from "../@/event";
import * as SpaceCore from "./space-core";
import { SpaceCoreDb } from "./space-core-db";
import type {
	ISpaceCoreDb,
	SpaceCoreDbWhere,
} from "./space-core-db/space-core-db";
import type { SpaceCoreEvent } from "./space-core-event";
import type * as SpaceState from "./space-core-state";

//
//
//
//
//
//

export type Deps = {
	spacesDb: ISpaceCoreDb;
};

export const deps = async (input: { dbConnKv: IDbConnKv }): Promise<Deps> => {
	return {
		spacesDb: SpaceCoreDb({
			t: "db-conn-kv",
			dbConnKv: input.dbConnKv,
		}),
	};
};

export const listSpaces = async (input: {
	spacesDb: ISpaceCoreDb;
	limit: number;
	offset: number;
	where?: SpaceCoreDbWhere;
	sort?: "newest" | "oldest";
}): Promise<SpaceCore.Model[]> => {
	const listed = await input.spacesDb.list({
		limit: input.limit,
		offset: input.offset,
		where: input.where,
	});

	const spaces = Result.withDefault(listed, []);

	return spaces;
};

export const getSpaceById = async (
	spacesDb: ISpaceCoreDb,
	spaceId: SpaceId,
): Promise<SpaceCore.Model> => {
	const got = await spacesDb.get(spaceId);

	const maybeSpace = Result.withDefault(got, null);

	const space = maybeSpace ?? SpaceCore.init;

	return space;
};

export const getSpaceStarted = async (
	spaceDb: ISpaceCoreDb,
	spaceId?: SpaceId | null,
): Promise<SpaceState.Started | null> => {
	if (!spaceId) {
		return null;
	}

	const spaceModel = Result.withDefault(await spaceDb.get(spaceId), null);

	if (!spaceModel) {
		return null;
	}

	const spaceState = SpaceCore.toSpaceStarted(spaceModel);

	return spaceState;
};

//
//
//
//
//
//

export const update = async ({
	spaceEvent,
	spacesDb,
}: {
	spacesDb: ISpaceCoreDb;
	spaceEvent: WithEventId<SpaceCoreEvent>;
}) => {
	const maybeSpace = Result.withDefault(
		await spacesDb.get(spaceEvent.spaceId),
		null,
	);

	const space = maybeSpace ?? SpaceCore.init;

	const spaceNew = SpaceCore.appendEvent({ event: spaceEvent, model: space });

	await spacesDb.upsert(spaceNew);
};

export const mergeOne = async ({
	spacesDb,
	space,
}: {
	spacesDb: ISpaceCoreDb;
	space: SpaceCore.Model;
}) => {
	const spaceId = SpaceCore.toSpaceId(space);

	if (!spaceId) {
		return;
	}

	const currentSpace = await getSpaceById(spacesDb, spaceId);

	const spaceNew = SpaceCore.mergeLeft(space, currentSpace);

	await spacesDb.upsert(spaceNew);
};

export const getEventWithMeta = async (
	spacesDb: ISpaceCoreDb,
	spaceId: SpaceId,
	eventId: EventId,
) => {
	const space = await getSpaceById(spacesDb, spaceId);

	if (!space) {
		return null;
	}

	const event = SpaceCore.toEventWithMeta(space, eventId);

	return event;
};

export const getSpaceByUserId = async (
	spacesDb: ISpaceCoreDb,
	userId: UserId,
): Promise<SpaceCore.Model | null> => {
	const got = await spacesDb.getByUserId(userId);

	const space = Result.withDefault(got, null);

	return space;
};

export const hasEvent = async (
	spacesDb: ISpaceCoreDb,
	spaceId: SpaceId,
	eventId: EventId,
) => {
	const space = await getSpaceById(spacesDb, spaceId);

	return SpaceCore.hasEvent(space, eventId);
};
