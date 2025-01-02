import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { broadcast, sendToClient, sendToUser } from '~/app/@/server/server-cmd'
import { AppServerCtx } from '~/app/@/server/server-ctx'
import { SpaceServerModule } from '../@/architecture/space-server'
import { SpaceCore } from '../core/space-core'
import { SpaceCoreState } from '../core/space-state'
import type { MsgToClient } from '../types'

const update: SpaceServerModule['update'] = async (input) => {
  return SpaceServerModule.andThen(
    {},
    () => updateFromClient(input),
    () => updateCurrentUserSpace(input),
    () => updateProfileCache(input),
    () => sendSpaceEventToClient(input),
    () => outputSpaceEventsFromServer(input)
  )
}

const updateProfileCache: SpaceServerModule['update'] = async (input) => {
  await input.ctx.profileCache.add(input.msgClient?.profiles ?? {})
  return {}
}

const updateFromClient: SpaceServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'sync': {
      await input.ctx.spacesCoreServer.merge(input.msgClient.space)

      const spaceId = SpaceCore.toSpaceId(input.msgClient.space)

      if (!spaceId) {
        return {}
      }

      const spaceNew = unwrapOr(await input.ctx.spacesCoreServer.get(spaceId), null)

      if (!spaceNew) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [spaceNew])

      const starting = EventSourced.startFromLatestSnapshot(spaceNew)

      return {
        msgCmd: [
          sendToClient<MsgToClient>([input.msgClient.clientId], {
            t: 'synced',
            causedBy: { msgClient: input.msgClient },
            space: starting,
            profiles: profiles
          })
        ]
      }
    }
    default: {
      return {}
    }
  }
}

const getAssociatedProfiles = async (ctx: AppServerCtx, spaces: SpaceCore.Model[]) => {
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

const updateCurrentUserSpace: SpaceServerModule['update'] = async (input) => {
  switch (input.msgEvt?.t) {
    case 'auth-evt.client-authenticated': {
      const space = unwrapOr(await input.ctx.spacesCoreServer.getByUserId(input.msgEvt.user.userId), null)

      if (!space) {
        return {}
      }

      const profiles = await getAssociatedProfiles(input.ctx, [space])

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToClient<MsgToClient>([input.msgEvt.clientId], {
            t: 'current-user-space',
            space: started,
            profiles,
            currentUser: input.msgEvt.user,
            causedBy: {
              msgEvt: input.msgEvt
            }
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

const sendSpaceEventToClient: SpaceServerModule['update'] = async (input) => {
  if (!input.msgCore) {
    return {}
  }

  const got = await input.ctx.spacesCoreServer.get(input.msgCore.spaceId)

  const space = unwrapOr(got, null) ?? SpaceCore.init

  const eventWithMeta = EventSourced.toEvent(space, input.msgCore.eventId)

  if (!eventWithMeta) {
    return {}
  }

  const spaceState = SpaceCore.toSpaceStarted(space)

  const profiles = unwrapOr(
    await input.ctx.profileCache.get('userId' in eventWithMeta ? [eventWithMeta.userId] : []),
    {}
  )

  const toClient: MsgToClient = {
    t: 'got-msg-core',
    c: eventWithMeta,
    profiles
  }

  if (spaceState && eventWithMeta.t === 'game') {
    return {
      msgCmd: [sendToUser<MsgToClient>(SpaceCoreState.toUserIds(spaceState), toClient)]
    }
  }

  return {
    msgCmd: [broadcast<MsgToClient>(toClient)]
  }
}

const outputSpaceEventsFromServer: SpaceServerModule['update'] = (input) => {
  switch (input.msgClient?.t) {
    case 'got-msg-core': {
      return {
        msgCore: [input.msgClient.c]
      }
    }
  }

  return {}
}

export const SyncServer = {
  update
}
