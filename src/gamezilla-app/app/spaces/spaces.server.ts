import { Msg } from 'gamezilla-app/@/core/msg'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { ClientId, SessionId, SpaceId, UserId } from '../@/data'
import { type Input, type Output, SpaceServerModule } from './architecture/space-server'
import { GameServer } from './game/game.server'
import { JoinSpaceServer } from './join-space/join-space.server'
import { ListSpacesServer } from './list-spaces/list-spaces.server'
import { ProfileCache } from './profile-cache'
import { GameDb } from './space/space-game-db'
import { SpaceGameServer } from './space/space-game.server'
import { SpacesDb } from './spaces-core/space-db'
import * as SpacesCoreServer from './spaces-core/spaces-core.server'
import type { ServerModule } from './spaces.types'
import { StartSpaceServer } from './start-space/start-space.server'
import { SyncServer } from './sync/sync.server'

//
//
//
// Init
//
//
//

export const getDeps: ServerModule['getDeps'] = async ({ ctx }) => {
  return {
    profileCache: ProfileCache({
      t: 'db-conn-kv',
      dbConnKv: ctx.dbConnKv
    }),
    spaceCoreDb: SpacesDb({
      t: 'db-conn-kv',
      dbConnKv: ctx.dbConnKv
    }),
    gameDb: GameDb({
      t: 'db-conn-kv',
      dbConnKv: ctx.dbConnKv
    }),
    gameServer: await GameServer.deps({
      ctx: {
        clientId: ClientId.generate(),
        dbConnKv: ctx.dbConnKv,
        dbConnSql: ctx.dbConnSql,
        env: ctx.env,
        logger: ctx.logger,
        now: ctx.now,
        sessionId: SessionId.generate(),
        sms: ctx.sms,
        space: {
          hostId: UserId.generate(),
          spaceId: SpaceId.generate(),
          users: {},
          visibility: 'public'
        },
        currentUserId: UserId.generate()
      }
    })
  }
}

export type Deps = Awaited<ReturnType<typeof getDeps>>

//
//
//
// Model
//
//
//

export const init: ServerModule['init'] = async () => {
  return {}
}

//
//
//
// Update
//
//
//

export const update: ServerModule['update'] = async (input) => {
  const updated = await updateMain(input)

  return {
    msgCmd: SpaceServerCmd.toServerCmd(updated.msgCmd)
  }
}

const updateMain = async (input: Input, initialAcc?: Output): Promise<Output> => {
  const acc = initialAcc ?? (await updateChild(input))

  const [spaceEvent, ...spaceEventsRest] = acc.msgSpaceEvent ?? []

  if (spaceEvent) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      msgSpaceEvent: spaceEvent
    })

    return updateMain(input, {
      msgSpaceEvent: Msg.batch(spaceEventsRest, updated.msgSpaceEvent),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: updated.msgEvt
    })
  }

  const [spaceCmd, ...spaceCmdsRest] = SpaceServerCmd.toSpaceServerCmd(acc.msgCmd)

  if (spaceCmd) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      msgCmd: spaceCmd
    })

    return updateMain(input, {
      msgSpaceEvent: Msg.batch(acc.msgSpaceEvent, updated.msgSpaceEvent),
      msgCmd: Msg.batch(spaceCmdsRest, updated.msgCmd),
      msgEvt: updated.msgEvt
    })
  }

  return acc
}

const updateChild: SpaceServerModule['update'] = async (input) => {
  if (
    input.msgSpaceEvent &&
    (await SpacesCoreServer.hasEvent(input.deps.spaceCoreDb, input.msgSpaceEvent.spaceId, input.msgSpaceEvent.eventId))
  ) {
    return {}
  }

  return SpaceServerModule.andThen(
    {},
    () => updateSpacesFromSpaceEvent(input),
    () => ListSpacesServer.update(input),
    () => SyncServer.update(input),
    () => StartSpaceServer.update(input),
    () => JoinSpaceServer.update(input),
    () => SpaceGameServer.update(input)
  )
}

const updateSpacesFromSpaceEvent: SpaceServerModule['update'] = async ({ msgSpaceEvent, deps }) => {
  if (!msgSpaceEvent) {
    return {}
  }

  await SpacesCoreServer.update({
    spacesDb: deps.spaceCoreDb,
    spaceEvent: msgSpaceEvent
  })

  return {}
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: ServerModule['subscriptions'] = async (input) => {
  return SpaceGameServer.subscriptions(input)
}
