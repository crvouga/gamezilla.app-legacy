import {
  ClientCtx,
  ClientEvt,
  ViewCtx,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Profile, SpaceId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ReqCtx,
  ServerCtx,
  ServerEvt,
} from "gamezilla/@CHILD/app/@SHARED/server";

//
//
//
//
//
//
//
//

export type Space = {
  visibility: "public" | "private";
  spaceId: SpaceId;
  hostId: UserId;
  users: {
    [userId: UserId]: UserId;
  };
};

type SpaceEvt =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

/**
 * @description
 * Represents outside events that happened in the server app
 */
export type SpaceServerEvt = ServerEvt | SpaceEvt;

/**
 * @description
 * Represents outside events that happened in the client app
 */
export type SpaceClientEvt = ClientEvt | SpaceEvt;

//
//
//
//
//
//
//

export type SpaceServerCtx = ServerCtx & SpaceCtx;

export type SpaceReqCtx = ReqCtx & SpaceCtx;

export type SpaceCtx = {
  space: Space;
};

export type SpaceClientCtx = ClientCtx & SpaceCtx;

export type SpaceViewCtx = ViewCtx &
  SpaceCtx & {
    quit: () => void;
    viewProfile: (userId: UserId) => void;
  };

//
//
//
//
//
//
//
//
//

export const spaceToProfiles = (ctx: SpaceViewCtx, space: Space) => {
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

export const spaceToHostTitle = (ctx: SpaceViewCtx, space: Space) => {
  const host = ctx.profiles[space.hostId];
  if (!host) {
    return null;
  }
  return `${host.username}'s space`;
};
