import { Msg } from '~/@/msg/msg'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { type Input, type Output, SpaceBackendModule } from './@/architecture/space-backend'
import { Space } from './@/space/space'
import { SpacesCoreBackend } from './core/backend'
import { GameBackend } from './game/backend'
import { JoinSpaceBackend } from './join-space/backend'
import { ListSpacesBackend } from './list-spaces/backend'
import { StartSpaceBackend } from './start-space/backend'
import { SyncBackend } from './sync/backend'
import type { BackendCtx, BackendModule } from './types'

//
//
//
// Init
//
//
//

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  return {
    ...input.ctx,

    spacesCoreBackend: await SpacesCoreBackend({
      t: 'db-conn-kv',
      dbConnKv: input.ctx.dbConnKv,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime,
    }),
    // spacesCoreBackend: await SpacesCoreBackend({
    //   t: 'stream',
    //   stream: await Stream({ t: 'in-memory', parser: WithEventMeta(MsgCore) }),
    //   dbConnKv: ctx.dbConnKv,
    //   logger: ctx.logger
    // }),
    games: GameBackend.initCtx({ ctx: { ...input.ctx, space: Space.random() } }),
  }
}

//
//
//
// Update
//
//
//

const update: BackendModule['update'] = async (input) => {
  const updated = await updateLoop(input)

  return {
    msgCmd: SpaceBackendCmd.toBackendCmd(updated.msgCmd),
  }
}

const updateLoop = async (input: Input, initialAcc?: Output): Promise<Output> => {
  const acc = initialAcc ?? (await updateChild(input))

  const [coreEvt, ...coreEvtRest] = acc.msgCore ?? []

  if (coreEvt) {
    const updated = await updateChild({
      ctx: input.ctx,
      msgCore: coreEvt,
    })

    return updateLoop(input, {
      msgCore: Msg.batch(coreEvtRest, updated.msgCore),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  const [cmd, ...cmdRest] = SpaceBackendCmd.toSpaceBackendCmd(acc.msgCmd)

  if (cmd) {
    const updated = await updateChild({
      ctx: input.ctx,
      msgCmd: cmd,
    })

    return updateLoop(input, {
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(cmdRest, updated.msgCmd),
      msgEvt: updated.msgEvt,
    })
  }

  return acc
}

const updateChild: SpaceBackendModule['update'] = async (input) => {
  return SpaceBackendModule.andThen(
    {},
    () => updateSpacesFromSpaceEvent(input),
    () => ListSpacesBackend.update(input),
    () => SyncBackend.update(input),
    () => StartSpaceBackend.update(input),
    () => JoinSpaceBackend.update(input),
    () => GameBackend.update(input),
  )
}

const updateSpacesFromSpaceEvent: SpaceBackendModule['update'] = async (input) => {
  if (!input.msgCore) {
    return {}
  }

  await input.ctx.spacesCoreBackend.update(input.msgCore)

  return {}
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return GameBackend.subscriptions(input)
}

export const SpacesBackend = {
  initCtx,
  update,
  subscriptions,
}
