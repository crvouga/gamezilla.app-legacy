import { Msg } from 'gamezilla-app/@/core/msg'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { type Input, type Output, SpaceServerModule } from './@/architecture/space-server'
import { Space } from './@/space'
import { SpacesCoreServer } from './core/server'
import { GameServer } from './game/server'
import { JoinSpaceServer } from './join-space/server'
import { ListSpacesServer } from './list-spaces/server'
import { StartSpaceServer } from './start-space/server'
import { SyncServer } from './sync/server'
import type { ServerModule } from './types'

//
//
//
// Init
//
//
//

export const initCtx: ServerModule['initDeps'] = async ({ ctx }) => {
  return {
    spacesCoreServer: await SpacesCoreServer({
      t: 'db-conn-kv',
      dbConnKv: ctx.dbConnKv,
      logger: ctx.logger
    }),
    // spacesCoreServer: await SpacesCoreServer({
    //   t: 'stream',
    //   stream: await Stream({ t: 'in-memory', parser: WithEventMeta(MsgCore) }),
    //   dbConnKv: ctx.dbConnKv,
    //   logger: ctx.logger
    // }),
    games: GameServer.initCtx({ ctx: { ...ctx, space: Space.random() } })
  }
}

export type Deps = Awaited<ReturnType<typeof initCtx>>

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
    () => GameServer.update(input)
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
  return GameServer.subscriptions(input)
}
