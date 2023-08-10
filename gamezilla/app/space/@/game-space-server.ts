import { UserId } from "gamezilla/app/@";
import { ServerReqCtx, ServerCtx } from "gamezilla/app/@";

export type GameSpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type GameSpaceReqCtx = ServerReqCtx & {
  hostId: UserId;
};
