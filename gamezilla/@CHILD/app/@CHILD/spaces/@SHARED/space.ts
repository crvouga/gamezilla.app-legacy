import { ClientCtx, ClientEvent } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  ClientId,
  Profile,
  SessionId,
  SpaceId,
  UserId,
} from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx, ServerEvent } from "gamezilla/@CHILD/app/@SHARED/server";

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

type SpaceEvent =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId };

/**
 * @description
 * Represents outside msgEvents that happened in the server app
 */
export type SpaceServerEvent = ServerEvent | SpaceEvent;

/**
 * @description
 * Represents outside msgEvents that happened in the client app
 */
export type SpaceClientEvent = ClientEvent | SpaceEvent;

//
//
//
//
//
//
//

export type SpaceServerCtx = ServerCtx & (SpaceCtx | SpaceReqCtx);

// DEPRECATED
export type SpaceReqCtx = SpaceCtx & {
  sessionId: SessionId;
  clientId: ClientId;
  currentUserId?: UserId | null;
};

export type SpaceCtx = {
  space: Space;
};

export type SpaceClientCtx = ClientCtx &
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

export const spaceToProfiles = (ctx: SpaceClientCtx, space: Space) => {
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

export const spaceToHostTitle = (ctx: SpaceClientCtx, space: Space) => {
  const host = ctx.profiles[space.hostId];
  if (!host) {
    return null;
  }
  return `${host.username}'s space`;
};
