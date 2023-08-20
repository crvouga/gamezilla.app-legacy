import { ClientCtx, ViewCtx } from "gamezilla/app/@SHARED/client";
import { Profile, SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import {
  ReqCtx,
  ServerCmd,
  ServerCtx,
  ServerEvt,
} from "gamezilla/app/@SHARED/server";

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
  profileCache?: {
    [userId: UserId]: Profile;
  };
};

export type SpaceEvt =
  | ServerEvt
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
  quit: () => void;
  viewProfile: (userId: UserId) => void;
  hostId: UserId;
  spaceId: SpaceId;
};

/**
 *
 *
 *
 *
 *
 */

export type SpaceServerCmd<ToClient> =
  | ServerCmd<ToClient>
  | { t: "send-to-space"; msg: ToClient };

const tagOne = <T extends string, A>(
  tag: T,
  cmd: SpaceServerCmd<A>
): SpaceServerCmd<{ t: T; c: A }> => {
  switch (cmd.t) {
    case "send-to-space": {
      return { ...cmd, msg: { t: tag, c: cmd.msg } };
    }
    default: {
      return ServerCmd.tagOne(tag, cmd);
    }
  }
};

const tag = <T extends string, A>(
  tag: T,
  cmd?: SpaceServerCmd<A>[]
): SpaceServerCmd<{ t: T; c: A }>[] | undefined => {
  return cmd?.map((m) => tagOne(tag, m));
};

export const SpaceServerCmd = {
  tagOne,
  tag,
};
