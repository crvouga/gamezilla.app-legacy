import { Err, Ok, Result, isErr } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { SpaceId, type UserId } from "gamezilla-app/app/@/data";
import {
	DbConnKv,
	type IDbConnKv,
} from "gamezilla-app/app/@/server/db-conn-kv";
import * as Space from "../space-core";
import type { ISpaceCoreDb } from "./space-core-db";

export type Deps = {
	dbConnKv: IDbConnKv;
};

export const ScoreCoreDb = (deps: Deps): ISpaceCoreDb => {
	const spacesBySpaceId = DbConnKv.withNamespace<SpaceId, Space.Model>(
		deps.dbConnKv,
		["spaces", "space-by-id"],
		Space.Model,
	);
	const indexSpaceIdByUserId = DbConnKv.withNamespace<UserId, SpaceId>(
		deps.dbConnKv,
		["spaces", "space-id-by-user-id"],
		SpaceId,
	);

	const INDEX_SPACE_IDS_KEY_ALL = "all";
	const indexSpaceIds = DbConnKv.withNamespace<string, SpaceId[]>(
		deps.dbConnKv,
		["spaces", "space-ids"],
		p.arr(SpaceId),
	);

	return {
		async get(spaceId) {
			if (!spaceId) {
				return Ok(null);
			}

			const got = await spacesBySpaceId.get(spaceId);

			if (isErr(got)) {
				return got;
			}

			return Ok(got.value);
		},

		async getByUserId(userId) {
			const got = await indexSpaceIdByUserId.get(userId);

			if (isErr(got)) {
				return got;
			}

			return this.get(got.value);
		},

		async upsert(space) {
			const spaceId = Space.toSpaceId(space);

			if (!spaceId) {
				return Err("Invalid space. Failed to derive spaceId");
			}

			const entries = Space.toUserIds(space).map(
				(userId): [UserId, SpaceId] => [userId, spaceId],
			);

			const allSpaceIds = new Set(
				Result.withDefault(
					await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL),
					null,
				) ?? [],
			);
			allSpaceIds.add(spaceId);

			const results = [
				await indexSpaceIds.set(
					INDEX_SPACE_IDS_KEY_ALL,
					Array.from(allSpaceIds),
				),
				await spacesBySpaceId.set(spaceId, space),
				await indexSpaceIdByUserId.setMany(entries),
			];

			return Result.mapOk(Result.combine(results), () => null);
		},

		async list(input) {
			const allSpaceIds =
				Result.withDefault(
					await indexSpaceIds.get(INDEX_SPACE_IDS_KEY_ALL),
					null,
				) ?? [];

			const subset = allSpaceIds.slice(
				input.offset,
				input.offset + input.limit,
			);

			return await spacesBySpaceId.getMany(subset);
		},
	};
};
