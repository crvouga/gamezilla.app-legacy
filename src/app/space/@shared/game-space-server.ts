import { UserId } from "src/app/@shared/app";
import { ServerReqCtx, ServerCtx } from "src/app/@shared/server";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
