import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { broadcast, sendToFrontend, sendToUser } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { SpaceBackendModule } from '../@/architecture/space-backend'
import { SpaceCore } from '../core/space-core'
import { SpaceCoreState } from '../core/space-state'
import type { MsgToFrontend } from '../types'

const update: SpaceBackendModule['update'] = async (input) => {
  return SpaceBackendModule.andThen(
    {},
    () => updateFromFrontend(input),
    () => updateCurrentUserSpace(input),
    () => updateProfileCache(input),
    () => sendSpaceEventToFrontend(input),
    () => outputSpaceEventsFromBackend(input),
  )
}

const updateProfileCache: SpaceBackendModule['update'] = async (input) => {
  await input.ctx.profileCache.add(input.msgFrontend?.profiles ?? {})
  return {}
}

const updateFromFrontend: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'sync': {
      await input.ctx.spacesCoreBackend.merge(input.msgFrontend.space)

      const spaceId = SpaceCore.toSpaceId(input.msgFrontend.space)

      if (!spaceId) {
        return {}
      }

      const spaceNew = unwrapOr(await input.ctx.spacesCoreBackend.get(spaceId), null)

      if (!spaceNew) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [spaceNew])

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return {
        msgCmd: [
          sendToFrontend<MsgToFrontend>([input.msgFrontend.frontendId], {
            t: 'synced',
            causedBy: { msgFrontend: input.msgFrontend },
            space: starting,
            profiles: profiles,
          }),
        ],
      }
    }
    default: {
      return {}
    }
  }
}

const getAssociatedProfiles = async (ctx: AppBackendCtx, spaces: SpaceCore.Model[]) => {
  const userIds = spaces.flatMap((space) => {
    const state = EventSourced.toState(SpaceCore.config, space)
    switch (state.type) {
      case 'started':
        return SpaceCoreState.toUserIds(state)
      default:
        return []
    }
  })

  const got = await ctx.profileCache.get(userIds)

  const profiles = unwrapOr(got, {})

  return profiles
}

const updateCurrentUserSpace: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgEvt?.t) {
    case 'auth-evt.frontend-authenticated': {
      const space = unwrapOr(await input.ctx.spacesCoreBackend.getByUserId(input.msgEvt.user.userId), null)

      if (!space) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [space])

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToFrontend<MsgToFrontend>([input.msgEvt.frontendId], {
            t: 'current-user-space',
            space: started,
            profiles,
            currentUser: input.msgEvt.user,
            causedBy: {
              msgEvt: input.msgEvt,
            },
          }),
        ],
      }
    }

    default: {
      return {}
    }
  }
}

const sendSpaceEventToFrontend: SpaceBackendModule['update'] = async (input) => {
  if (!input.msgCore) {
    return {}
  }

  const got = await input.ctx.spacesCoreBackend.get(input.msgCore.spaceId)

  const space = unwrapOr(got, null) ?? SpaceCore.init

  const eventWithMeta = EventSourced.toEvent(space, input.msgCore.eventId)

  if (!eventWithMeta) {
    return {}
  }

  const spaceState = SpaceCore.toSpaceStarted(space)

  const profiles = unwrapOr(
    await input.ctx.profileCache.get('userId' in eventWithMeta ? [eventWithMeta.userId] : []),
    {},
  )

  const toFrontend: MsgToFrontend = {
    t: 'got-msg-core',
    c: eventWithMeta,
    profiles,
  }

  if (spaceState && eventWithMeta.t === 'game') {
    return {
      msgCmd: [sendToUser<MsgToFrontend>(SpaceCoreState.toUserIds(spaceState), toFrontend)],
    }
  }

  return {
    msgCmd: [broadcast<MsgToFrontend>(toFrontend)],
  }
}

const outputSpaceEventsFromBackend: SpaceBackendModule['update'] = (input) => {
  switch (input.msgFrontend?.t) {
    case 'got-msg-core': {
      return {
        msgCore: [input.msgFrontend.c],
      }
    }
  }

  return {}
}

export const SyncBackend = {
  update,
}
