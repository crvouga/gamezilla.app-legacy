import { broadcast, sendToClient, sendToUser } from 'gamezilla-app/app/@/server'
import { Result, isErr } from 'gamezilla-app/@/core'
import { SpaceServerModule } from '../architecture/space-server'
import { SpaceCoreState } from '../spaces-core'
import * as Space from '../spaces-core/space-core'
import * as SpacesCoreServer from '../spaces-core/spaces-core.server'
import type { MsgToClient, ServerDeps } from '../spaces.types'

const update: SpaceServerModule['update'] = async (input) => {
  return SpaceServerModule.andThen(
    {},
    () => updateCore(input),
    () => updateCurrentUserSpace(input),
    () => updateProfileCache(input),
    () => sendSpaceEventToClient(input),
    () => outputSpaceEventsFromServer(input)
  )
}

const updateProfileCache: SpaceServerModule['update'] = async (input) => {
  const added = await input.deps.profileCache.add(input.msgClient?.profiles ?? {})
  if (isErr(added)) {
    input.ctx.logger.error(`Error adding to profile cache. ${added.error}`)
    return {}
  }

  return {}
}

const updateCore: SpaceServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'sync': {
      await SpacesCoreServer.mergeOne({
        spacesDb: input.deps.spaceCoreDb,
        space: input.msgClient.space
      })

      const spaceId = Space.toSpaceId(input.msgClient.space)

      if (!spaceId) {
        return {}
      }

      const spaceNew = await SpacesCoreServer.getSpaceById(input.deps.spaceCoreDb, spaceId)

      if (!spaceNew) {
        return {}
      }

      const profiles = await spacesToProfiles(input.deps, [spaceNew])

      const starting = Space.startFromLatestSnapshot(spaceNew)

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

const spacesToProfiles = async (deps: ServerDeps, spaces: Space.Model[]) => {
  const userIds = spaces.flatMap((space) => {
    const state = Space.deriveState(space)
    if (state.type === 'started') {
      return Object.values(state.users)
    }
    return []
  })

  const got = await deps.profileCache.get(userIds)

  const profiles = Result.withDefault(got, {})

  return profiles
}

const updateCurrentUserSpace: SpaceServerModule['update'] = async (input) => {
  const { msgEvt, deps } = input

  switch (msgEvt?.t) {
    case 'auth/client-authenticated': {
      const space = await SpacesCoreServer.getSpaceByUserId(deps.spaceCoreDb, msgEvt.account.userId)

      if (!space) {
        return {}
      }

      const profiles = await spacesToProfiles(input.deps, [space])

      const started = Space.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToClient<MsgToClient>([msgEvt.clientId], {
            t: 'current-user-space',
            space: started,
            profiles,
            causedBy: { msgEvt }
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

const sendSpaceEventToClient: SpaceServerModule['update'] = async ({ msgSpaceEvent, deps }) => {
  if (!msgSpaceEvent) {
    return {}
  }

  const msgEvtWithMeta = await SpacesCoreServer.getEventWithMeta(
    deps.spaceCoreDb,
    msgSpaceEvent.spaceId,
    msgSpaceEvent.eventId
  )

  if (!msgEvtWithMeta) {
    return {}
  }

  const spaceState = await SpacesCoreServer.getSpaceStarted(deps.spaceCoreDb, msgEvtWithMeta.spaceId)

  const profiles = Result.withDefault(
    await deps.profileCache.get('userId' in msgEvtWithMeta ? [msgEvtWithMeta.userId] : []),
    {}
  )

  const toClient: MsgToClient = {
    t: 'event',
    c: msgEvtWithMeta,
    profiles
  }

  if (spaceState && msgEvtWithMeta.t === 'game') {
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
    case 'event': {
      return {
        msgSpaceEvent: [input.msgClient.c]
      }
    }
  }

  return {}
}

export const SyncServer = {
  update
}
