import { ClientCtx, ViewCtx } from "gamezilla/app/@/client";
import { SpaceId, UserId } from "gamezilla/app/@/data";
import { ReqCtx, ServerCtx } from "gamezilla/app/@/server";

/**
 *
 *
 *
 */
export type Space<GameModel> = {
  visibility?: "public" | "private";
  state?: "started" | "ended";
  spaceId: SpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
  game?: GameModel | null;
};

export type SpaceMsg =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

/**
 *
 *
 *
 */
export type SpaceServerCtx = ServerCtx & {
  hostId: UserId;
};

export type SpaceReqCtx = ReqCtx & {
  hostId: UserId;
};

/**
 *
 *
 *
 *
 */

export type SpaceClientCtx = ClientCtx & {
  hostId: UserId;
};

export type SpaceViewCtx = ViewCtx & {
  onQuit: () => void;
  onViewProfile: (input: { userId: UserId }) => void;
  hostId: UserId;
  spaceId: SpaceId;
};
