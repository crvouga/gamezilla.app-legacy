import { UserId } from "@gamezilla/shared/app";
import { ServerReqCtx, ServerCtx } from "@gamezilla/shared/server";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
