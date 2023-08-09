import { UserId } from "src/shared/app";
import { ServerReqCtx, ServerCtx } from "src/shared/server";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
