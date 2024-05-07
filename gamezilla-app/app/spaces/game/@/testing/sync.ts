import type { SpaceId, UserId } from "gamezilla-app/app/@/data";
import type { SpaceCtx } from "../../../@/space";

const hostUserId = "test-user-id" as UserId;

const currentSpaceId = "test-space-id" as SpaceId;

export const SpaceGameCoreFixture = async () => {
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
