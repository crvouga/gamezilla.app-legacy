import { Msg } from '~/@/msg/msg'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { type Input, type Output, SpaceBackendModule } from './@/architecture/space-backend'
import { Space } from './@/space/space'
import { SpaceBackend } from './space/backend'
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

    spaceBackend: await SpaceBackend({
      t: 'db-conn-kv',
      dbConnKv: input.ctx.dbConnKv,
      logger: input.ctx.logger,
      runtime: input.ctx.runtime,
    }),
    // spaceBackend: await SpaceBackend({
    //   t: 'stream',
    //   stream: await Stream({ t: 'in-memory', parser: WithEventMeta(MsgSpace) }),
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

  const [spaceEvt, ...spaceEvtRest] = acc.msgSpace ?? []

  if (spaceEvt) {
    const updated = await updateChild({
      ctx: input.ctx,
      msgSpace: spaceEvt,
    })

    return updateLoop(input, {
      msgSpace: Msg.batch(spaceEvtRest, updated.msgSpace),
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
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
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
  if (!input.msgSpace) {
    return {}
  }

  await input.ctx.spaceBackend.update(input.msgSpace)

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
