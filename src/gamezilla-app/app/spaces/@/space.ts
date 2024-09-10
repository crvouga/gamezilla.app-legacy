import { p } from 'gamezilla-app/@/core/parser'
import type { ClientCtx, ClientEvt } from 'gamezilla-app/app/@/client'
import { SpaceId, UserId, type ClientId, type Profile, type SessionId } from 'gamezilla-app/app/@/data'
import type { ServerCtx, ServerEvt } from 'gamezilla-app/app/@/server'

//
//
//
//
//
//
//
//

export const Space = p.obj({
  visibility: p.enumeration(['public', 'private']),
  spaceId: SpaceId,
  hostId: UserId,
  users: p.dict(UserId, UserId)
})

export type Space = p.Infer<typeof Space>

type SpaceEvt =
  | {
      t: 'space.user-left-space'
      spaceId: SpaceId
      userId: UserId
    }
  | {
      t: 'space.user-joined-space'
      spaceId: SpaceId
      userId: UserId
    }

export type SpaceServerEvt = ServerEvt | SpaceEvt

export type SpaceClientEvt = ClientEvt | SpaceEvt

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
