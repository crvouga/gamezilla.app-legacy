import { ClientCtx, ClientEvent } from "gamezilla-app/@CHILD/app/@SHARED/client"
import {
  ClientId,
  Profile,
  SessionId,
  SpaceId,
  UserId,
} from "gamezilla-app/@CHILD/app/@SHARED/data"
import { ServerCtx, ServerEvent } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { P1 } from "gamezilla-app/@SHARED/parsing"
import { z } from "zod"

//
//
//
//
//
//
//
//

export type Space = {
  visibility: "public" | "private"
  spaceId: SpaceId
  hostId: UserId
  users: {
    [userId: UserId]: UserId
  }
}

const Space = z.object({
  visibility: z.enum(["public", "private"]),
  spaceId: z.string().refine(SpaceId.is),
  hostId: z.string().refine(UserId.is),
  users: z.record(z.string().refine(UserId.is)),
})

export const toSpace = (x: unknown): Space | null => {
  if (
    P1.obj(x) &&
    P1.has(
      x,
      "visibility",
      P1.or(P1.literal("public"), P1.literal("private")),
    ) &&
    P1.has(x, "spaceId", SpaceId.is) &&
    P1.has(x, "hostId", UserId.is) &&
    P1.has(x, "users", P1.dict(UserId.is, UserId.is))
  ) {
    return x
  }
  return null
}

export const isSpace = P1.is(toSpace)

type SpaceEvent =
  | { t: "user-left"; userId: UserId }
  | { t: "user-joined"; userId: UserId }

/**
 * @description
 * Represents outside msgEvts that happened in the server app
 */
export type SpaceServerEvent = ServerEvent | SpaceEvent

/**
 * @description
 * Represents outside msgEvts that happened in the client app
 */
export type SpaceClientEvent = ClientEvent | SpaceEvent

//
//
//
//
//
//
//

export type SpaceServerCtx = ServerCtx & (SpaceCtx | SpaceReqCtx)

// DEPRECATED
export type SpaceReqCtx = SpaceCtx & {
  sessionId: SessionId
  clientId: ClientId
  currentUserId?: UserId | null
}

export type SpaceCtx = {
  space: Space
}

export type SpaceClientCtx = ClientCtx & SpaceCtx

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
  const profiles: Profile[] = []
  for (const userId in space.users) {
    if (!UserId.is(userId)) {
      continue
    }
    const profile = ctx.profiles[userId]
    if (!profile) {
      continue
    }
    profiles.push(profile)
  }
  return profiles
}

export const spaceToHostTitle = (ctx: SpaceClientCtx, space: Space) => {
  const host = ctx.profiles[space.hostId]
  if (!host) {
    return null
  }
  return `${host.username}'s space`
}
