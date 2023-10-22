import { ClientCtx, ViewCtx } from "gamezilla/app/@SHARED/client";
import { Profile, SpaceId, UserId } from "gamezilla/app/@SHARED/data";
import { ReqCtx, ServerCtx, ServerEvt } from "gamezilla/app/@SHARED/server";

/**
 *
 *
 *
 */
export type Space<T> = ProfileCache &
  Game<T> & {
    visibility: "public" | "private";
    state: "started" | "ended";
    spaceId: SpaceId;
    hostId: UserId;
    users: {
      [userId: UserId]: UserId;
    };
  };

export const initSpace = <T>({
  spaceId,
  hostId,
}: {
  spaceId: SpaceId;
  hostId: UserId;
}): Space<T> => {
  return {
    state: "started",
    visibility: "public",
    spaceId,
    hostId,
    users: {},
  };
};

export type Game<T> = { game?: T | null };

export type ProfileCache = {
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

export type SpaceCtx = {
  hostId: UserId;
};

export type SpaceClientCtx = ClientCtx & SpaceCtx;

export type SpaceViewCtx = ViewCtx & {
  quit: () => void;
  viewProfile: (userId: UserId) => void;
  hostId: UserId;
  spaceId: SpaceId;
  space: Space<unknown>;
};

export const spaceToProfiles = <T>(ctx: SpaceViewCtx, space: Space<T>) => {
  const profiles: Profile[] = [];
  for (const userId in space.users) {
    if (!UserId.is(userId)) {
      continue;
    }
    const profile = ctx.profiles[userId];
    if (!profile) {
      continue;
    }
    profiles.push(profile);
  }
  return profiles;
};

export const spaceToHostTitle = <T>(ctx: SpaceViewCtx, space: Space<T>) => {
  const host = ctx.profiles[space.hostId];
  if (!host) {
    return null;
  }
  return `${host.username}'s space`;
};
