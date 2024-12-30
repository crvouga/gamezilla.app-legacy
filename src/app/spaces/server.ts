import { Msg } from '~/@/msg/msg'
import { SpaceServerCmd } from '~/app/spaces/@/space-server-cmd'
import { AppServerCtx } from '../@/server/server-ctx'
import { type Input, type Output, SpaceServerModule } from './@/architecture/space-server'
import { Space } from './@/space'
import { SpacesCoreServer } from './core/server'
import { GameServer } from './game/server'
import { JoinSpaceServer } from './join-space/server'
import { ListSpacesServer } from './list-spaces/server'
import { StartSpaceServer } from './start-space/server'
import { SyncServer } from './sync/server'
import type { ServerCtx, ServerModule } from './types'

//
//
//
// Init
//
//
//

const initCtx = async (input: { ctx: AppServerCtx }): Promise<ServerCtx> => {
  return {
    ...input.ctx,

    spacesCoreServer: await SpacesCoreServer({
      t: 'db-conn-kv',
      dbConnKv: input.ctx.dbConnKv,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime
    }),
    // spacesCoreServer: await SpacesCoreServer({
    //   t: 'stream',
    //   stream: await Stream({ t: 'in-memory', parser: WithEventMeta(MsgCore) }),
    //   dbConnKv: ctx.dbConnKv,
    //   logger: ctx.logger
    // }),
    games: GameServer.initCtx({ ctx: { ...input.ctx, space: Space.random() } })
  }
}

//
//
//
// Update
//
//
//

const update: ServerModule['update'] = async (input) => {
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

const updateSpacesFromSpaceEvent: SpaceServerModule['update'] = async (input) => {
  if (!input.msgCore) {
    return {}
  }

  await input.ctx.spacesCoreServer.update(input.msgCore)

  return {}
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: ServerModule['subscriptions'] = async (input) => {
  return GameServer.subscriptions(input)
}

export const SpacesServer = {
  initCtx,
  update,
  subscriptions
}
