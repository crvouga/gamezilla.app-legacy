import { Logger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendCtx } from '~/app/spaces/@/space-backend/ctx'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { PackDb } from './@/pack/pack-db'
import { PackListBackend } from './@/pack/pack-list'
import { PackPuzzlesGridBackend } from './@/pack/pack-puzzles-grid/backend'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleListBackend } from './@/puzzle/puzzle-list/backend'
import { FlowBackendCtx } from './@/backend/ctx'
import { Solutions } from './@/solutions/solutions'
import { BuilderBackend } from './builder/backend'
import { PlayBackend } from './play/backend'
import type { BackendModule } from './types'

export const initCtx = (input: { ctx: SpaceBackendCtx }): FlowBackendCtx => {
  return {
    ...input.ctx,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: Logger({ t: 'noop' }) }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql }),
    solutions: Solutions.init,
  }
}

const init: BackendModule['init'] = {
  t: 'none',
}

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    () => updatePlay(input),
    () => updateBuilder(input),
    () => updatePackList(input),
    () => updatePackPuzzlesGrid(input),
    () => updatePuzzleList(input),
  )
}

const updatePackList: BackendModule['update'] = async (input) => {
  const updated = await PackListBackend.update({
    ...input,
    msgFrontend: input.msgFrontend?.t === 'pack-list' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
    msg: input.msg?.t === 'pack-list' ? input.msg.c : null,
  })

  return {
    msgCmd: SpaceBackendCmd.tag('pack-list', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
}

const updatePuzzleList: BackendModule['update'] = async (input) => {
  const updated = await PuzzleListBackend.update({
    ...input,
    msgFrontend: input.msgFrontend?.t === 'puzzle-list' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
    msg: input.msg?.t === 'puzzle-list' ? input.msg.c : null,
  })

  return {
    msgCmd: SpaceBackendCmd.tag('puzzle-list', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
}

const updatePackPuzzlesGrid: BackendModule['update'] = async (input) => {
  const updated = await PackPuzzlesGridBackend.update({
    ...input,
    msg: input.msg?.t === 'pack-puzzles-grid' ? input.msg.c : null,
    msgFrontend: input.msgFrontend?.t === 'pack-puzzles-grid' ? { ...input.msgFrontend, ...input.msgFrontend.c } : null,
    deps: null,
  })

  return {
    msgCmd: SpaceBackendCmd.tag('pack-puzzles-grid', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
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
