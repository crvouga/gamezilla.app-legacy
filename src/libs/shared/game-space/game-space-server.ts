import { UserId } from "@gamezilla/shared/app";
import { AuthReqServerCtx, ServerCtx } from "@gamezilla/shared/server";

export type SpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type SpaceReqServerCtx = AuthReqServerCtx & {
  hostId: UserId;
};

export type ServerGameSpaceMsg = { t: "user-left"; userId: UserId };
