import { Sub } from '~/@/sub'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/backend/ctx'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { FlowBackendCtx } from './@/backend/ctx'
import { PackDb } from './@/pack/pack-db/impl'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { Solutions } from './@/solutions/solutions'
import { BuilderBackend } from './builder/backend'
import { PlayBackend } from './play/backend'
import type { BackendModule } from './types'

export const initCtx = (input: { ctx: SpaceBackendCtx }): FlowBackendCtx => {
  return {
    ...input.ctx,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger }),
    solutions: Solutions.init,
  }
}

const init: BackendModule['init'] = {
  t: 'noop',
}

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => updatePlay(input),
    () => updateBuilder(input),
  )
}

const updateBuilder: BackendModule['update'] = async (input) => {
  const updated = await BuilderBackend.update({
    ...input,
    modelSpace: input.modelSpace.builder,
    msgFrontend: input.msgFrontend?.t === 'builder' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
    msgSpace: input.msgSpace?.t === 'builder' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: null,
  })

  return {
    msgCmd: SpaceBackendCmd.tag('builder', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, t: 'builder', c })),
    msgEvt: updated.msgEvt,
  }
}

const updatePlay: BackendModule['update'] = async (input) => {
  const updated = await PlayBackend.update({
    ctx: input.ctx,
    modelSpace: input.modelSpace.play,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgFrontend: input.msgFrontend?.t === 'play' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
    msgSpace: input.msgSpace?.t === 'play' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
    deps: null,
  })

  return {
    msgCmd: SpaceBackendCmd.tag('play', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, t: 'play', c })),
    msgEvt: updated.msgEvt,
  }
}

const subscriptions: BackendModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const FlowBackend = {
  init,
  subscriptions,
  update,
  initCtx,
}
