import type { SpaceId, UserId } from "gamezilla-app/app/@/data";
import type { Task } from "gamezilla-app/@/core";
import type * as SpaceCore from "../space-core";

export type ISpaceCoreDb = {
	list: (input: {
		limit: number;
		offset: number;
		where?: {
			spaceId?: SpaceId;
			userId?: UserId;
		};
	}) => Task<string, SpaceCore.Model[]>;

	get: (spaceId: SpaceId | null) => Task<string, SpaceCore.Model | null>;

	getByUserId: (userId: UserId) => Task<string, SpaceCore.Model | null>;

	upsert: (space: SpaceCore.Model) => Task<string, null>;
};
