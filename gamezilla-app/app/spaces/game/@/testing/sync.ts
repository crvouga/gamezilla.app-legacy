import { type SpaceId, type UserId } from "gamezilla-app/app/@/data";
import type { SpaceCtx } from "../../../@/space";

const hostUserId = "test-user-id" as UserId;

const currentSpaceId = "test-space-id" as SpaceId;

export const SpaceGameSyncFixture = async () => {
	const ctx: SpaceCtx = {
		space: {
			hostId: hostUserId,
			spaceId: currentSpaceId,
			users: {
				[hostUserId]: hostUserId,
			},
			visibility: "public",
		},
	};

	return {
		ctx,
	};
};
