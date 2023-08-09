import { UserId } from "gamezilla/app/@/app";
import { ServerReqCtx, ServerCtx } from "gamezilla/app/@/server";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
