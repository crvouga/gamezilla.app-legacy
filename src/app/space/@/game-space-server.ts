import { UserId } from "src/app/@/app";
import { ServerReqCtx, ServerCtx } from "src/app/@/server";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
