import { Msg } from 'gamezilla-app/@/core/msg'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { SpaceId, UserId } from '../@/data'
import { type Input, type Output, SpaceServerModule } from './@/architecture/space-server'
import { GameServer } from './games/game.server'
import { GameDb } from './games/space-game-db'
import { SpaceGameServer } from './games/space-game.server'
import { JoinSpaceServer } from './join-space/server'
import { ListSpacesServer } from './list-spaces/server'
import { SpacesCoreServer } from './core/server'
import type { ServerModule } from './types'
import { StartSpaceServer } from './start-space/server'
import { SyncServer } from './sync/server'

//
//
//
// Init
//
//
//

export const initDeps: ServerModule['initDeps'] = async ({ ctx }) => {
  return {
    spacesCoreServer: await SpacesCoreServer({ t: 'db-conn-kv', dbConnKv: ctx.dbConnKv, logger: ctx.logger }),
    gameDb: GameDb({ t: 'db-conn-kv', dbConnKv: ctx.dbConnKv }),
    gameServer: GameServer.initCtx({
      ctx: {
        ...ctx,
        space: { hostId: UserId.generate(), spaceId: SpaceId.generate(), users: {}, visibility: 'public' }
      }
    })
  }
}

export type Deps = Awaited<ReturnType<typeof initDeps>>

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

  const [coreEvt, ...coreEvtRest] = acc.msgCore ?? []

  if (coreEvt) {
    const updated = await updateChild({
      deps: input.deps,
      ctx: input.ctx,
      msgCore: coreEvt
    })

    return updateLoop(input, {
      msgCore: Msg.batch(coreEvtRest, updated.msgCore),
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
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: updated.msgEvt
    })
  }

  return acc
}

const updateChild: SpaceServerModule['update'] = async (input) => {
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

const updateSpacesFromSpaceEvent: SpaceServerModule['update'] = async ({ msgCore, deps }) => {
  if (!msgCore) {
    return {}
  }

  await deps.spacesCoreServer.update(msgCore)

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
