import { Profile } from '~/app/@/data/profile'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { SpaceCtx } from '../space/ctx'

export type SpaceFrontendCtx = AppFrontendCtx & SpaceCtx

const toProfiles = (ctx: SpaceFrontendCtx) => {
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

const toHostTitle = (ctx: SpaceFrontendCtx) => {
  const host = ctx.profiles[ctx.space.hostId]
  if (!host) {
    return null
  }
  return `${host.username}'s space`
}

const isCurrentUserGuest = (ctx: SpaceFrontendCtx) => {
  return ctx.currentUserId !== ctx.space.hostId
}

export const SpaceFrontendCtx = {
  toProfiles,
  toHostTitle,
  isCurrentUserGuest,
}
