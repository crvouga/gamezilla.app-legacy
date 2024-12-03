import { AppClientCtx } from '~/app/@/client'
import { Profile, UserId } from '~/app/@/data'
import { SpaceCtx } from './space-ctx'

export type SpaceClientCtx = AppClientCtx & SpaceCtx

const toProfiles = (ctx: SpaceClientCtx) => {
  const profiles: Profile[] = []
  for (const userId in ctx.space.users) {
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

const toHostTitle = (ctx: SpaceClientCtx) => {
  const host = ctx.profiles[ctx.space.hostId]
  if (!host) {
    return null
  }
  return `${host.username}'s space`
}

const isCurrentUserGuest = (ctx: SpaceClientCtx) => {
  return ctx.currentUserId !== ctx.space.hostId
}

export const SpaceClientCtx = {
  toProfiles,
  toHostTitle,
  isCurrentUserGuest
}
