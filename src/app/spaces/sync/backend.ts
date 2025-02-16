import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { broadcast, sendToFrontend, sendToUser } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { SpaceBackendModule } from '../architecture/space-backend'
import { Space } from '../core/space'
import { SpaceState } from '../core/space-state'
import type { MsgToFrontend } from '../types'

const update: SpaceBackendModule['update'] = async (input) => {
  return SpaceBackendModule.andThen(
    {},
    () => updateFromFrontend(input),
    () => updateCurrentUserSpace(input),
    () => updateProfileCache(input),
    () => sendMsgSpaceToFrontend(input),
    () => outputMsgSpacesFromBackend(input),
  )
}

const updateProfileCache: SpaceBackendModule['update'] = async (input) => {
  await input.ctx.profileCache.add(input.msgFrontend?.profiles ?? {})
  return {}
}

const updateFromFrontend: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'sync.sync': {
      await input.ctx.spacesCore.merge(input.msgFrontend.space)

      const spaceId = Space.toSpaceId(input.msgFrontend.space)

      if (!spaceId) {
        return {}
      }

      const spaceNew = unwrapOr(await input.ctx.spacesCore.get(spaceId), null)

      if (!spaceNew) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [spaceNew])

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return {
        msgCmd: [
          sendToFrontend<MsgToFrontend>([input.msgFrontend.clientId], {
            t: 'sync.synced',
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

const getAssociatedProfiles = async (ctx: AppBackendCtx, spaces: Space.Model[]) => {
  const userIds = spaces.flatMap((space) => {
    const state = EventSourced.toState(Space.config, space)
    switch (state.type) {
      case 'started':
        return SpaceState.toUserIds(state)
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
    case 'auth-evt.client-authenticated': {
      const space = unwrapOr(await input.ctx.spacesCore.getByUserId(input.msgEvt.user.userId), null)

      if (!space) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [space])

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToFrontend<MsgToFrontend>([input.msgEvt.clientId], {
            t: 'sync.synced',
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

const sendMsgSpaceToFrontend: SpaceBackendModule['update'] = async (input) => {
  if (!input.msgSpace) {
    return {}
  }

  const got = await input.ctx.spacesCore.get(input.msgSpace.spaceId)

  const space = unwrapOr(got, null) ?? Space.init

  const eventWithMeta = EventSourced.toEvent(space, input.msgSpace.eventId)

  if (!eventWithMeta) {
    return {}
  }

  const spaceState = Space.toSpaceStarted(space)

  const profiles = unwrapOr(
    await input.ctx.profileCache.get('userId' in eventWithMeta ? [eventWithMeta.userId] : []),
    {},
  )

  const toFrontend: MsgToFrontend = {
    t: 'sync.got-msg-space',
    c: eventWithMeta,
    profiles,
  }

  if (spaceState && eventWithMeta.t === 'game') {
    return {
      msgCmd: [sendToUser<MsgToFrontend>(SpaceState.toUserIds(spaceState), toFrontend)],
    }
  }

  return {
    msgCmd: [broadcast<MsgToFrontend>(toFrontend)],
  }
}

const outputMsgSpacesFromBackend: SpaceBackendModule['update'] = (input) => {
  switch (input.msgFrontend?.t) {
    case 'sync.got-msg-space': {
      return {
        msgSpace: [input.msgFrontend.c],
      }
    }
  }

  return {}
}

export const SyncBackend = {
  update,
}
