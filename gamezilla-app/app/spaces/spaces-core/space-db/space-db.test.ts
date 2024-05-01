import { describe, expect, it } from "bun:test";
import { SpacesDb } from "./space-db-impl";
import { DbConnKv } from "gamezilla-app/app/@shared/server/db-conn-kv";
import * as Space from "../space";
import { Ok, pipe } from "gamezilla-app/@shared/core";
import { EventId } from "../../@shared/event";
import { SpaceId, UserId } from "gamezilla-app/app/@shared/data";

const generateSpace = () => {
	return pipe(
		Space.init,
		//
		(space) =>
			Space.appendEvent({
				model: space,
				event: {
					t: "user-started-space",
					eventId: EventId.generate(),
					spaceId: SpaceId.generate(),
					userId: UserId.generate(),
				},
			}),
	);
};

const Fixture = async () => {
	const spacesDb = SpacesDb({
		t: "db-conn-kv",
		dbConnKv: await DbConnKv({ t: "hash-map" }),
	});

	const spaceA = generateSpace();

	return {
		spacesDb,
		spaceA,
	};
};

describe(import.meta.file, () => {
	it("should work", async () => {
		const f = await Fixture();

		const spaceId = Space.toSpaceStarted(f.spaceA)?.spaceId ?? null;

		const before = await f.spacesDb.get(spaceId);

		const upserted = await f.spacesDb.upsert(f.spaceA);

		const after = await f.spacesDb.get(spaceId);

		expect(before).toEqual(Ok(null));
		expect(upserted).toEqual(Ok(null));
		expect(after).toEqual(Ok(f.spaceA));
	});

	it("should be able to list spaces", async () => {
		const f = await Fixture();

		const before = await f.spacesDb.list({
			limit: 10,
			offset: 0,
		});

		const upserted = await f.spacesDb.upsert(f.spaceA);

		const after = await f.spacesDb.list({
			limit: 10,
			offset: 0,
		});

		expect(before).toEqual(Ok([]));
		expect(upserted).toEqual(Ok(null));
		expect(after).toEqual(Ok([f.spaceA]));
	});
});
