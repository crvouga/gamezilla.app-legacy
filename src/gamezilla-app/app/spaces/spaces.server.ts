import { Msg } from 'gamezilla-app/@/core/msg'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { ClientId, SessionId, SpaceId, UserId } from '../@/data'
import { type Input, type Output, SpaceServerModule } from './architecture/space-server'
import { GameServer } from './game/game.server'
import { JoinSpaceServer } from './join-space/join-space.server'
import { ListSpacesServer } from './list-spaces/list-spaces.server'
import { ProfileCache } from './spaces-server/profile-cache'
import { GameDb } from './game/space-game-db'
import { SpaceGameServer } from './game/space-game.server'
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

export const initDeps: ServerModule['initDeps'] = async ({ ctx }) => {
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
    gameServer: GameServer.initCtx({
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

export type Deps = Awaited<ReturnType<typeof initDeps>>

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
  const updated = await updateLoop(input)

  return {
    msgCmd: SpaceServerCmd.toServerCmd(updated.msgCmd)
  }
}

const updateLoop = async (input: Input, initialAcc?: Output): Promise<Output> => {
  const acc = initialAcc ?? (await updateChild(input))

  const [coreEvt, ...coreEvtRest] = acc.msgCoreEvt ?? []

  if (coreEvt) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      msgCoreEvt: coreEvt
    })

    return updateLoop(input, {
      msgCoreEvt: Msg.batch(coreEvtRest, updated.msgCoreEvt),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: updated.msgEvt
    })
  }

  const [cmd, ...cmdRest] = SpaceServerCmd.toSpaceServerCmd(acc.msgCmd)

  if (cmd) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      msgCmd: cmd
    })

    return updateLoop(input, {
      msgCoreEvt: Msg.batch(acc.msgCoreEvt, updated.msgCoreEvt),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: updated.msgEvt
    })
  }

  return acc
}

const updateChild: SpaceServerModule['update'] = async (input) => {
  if (
    input.msgCoreEvt &&
    (await SpacesCoreServer.hasEvent(input.deps.spaceCoreDb, input.msgCoreEvt.spaceId, input.msgCoreEvt.eventId))
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

const updateSpacesFromSpaceEvent: SpaceServerModule['update'] = async ({ msgCoreEvt, deps }) => {
  if (!msgCoreEvt) {
    return {}
  }

  await SpacesCoreServer.update({
    spacesDb: deps.spaceCoreDb,
    spaceEvent: msgCoreEvt
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
