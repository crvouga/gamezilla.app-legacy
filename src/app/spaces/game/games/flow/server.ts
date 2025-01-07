import { Logger } from '~/@/logger'
import { Sub } from '~/@/sub'
import { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceServerCtx } from '~/app/spaces/@/space-server/ctx'
import { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { PackDb } from './@/pack/pack-db'
import { PackListServer } from './@/pack/pack-list'
import { PackPuzzlesGridServer } from './@/pack/pack-puzzles-grid/server'
import { PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleListServer } from './@/puzzle/puzzle-list'
import { FlowServerCtx } from './@/server/ctx'
import { Solutions } from './@/solutions/solutions'
import { BuilderServer } from './builder/server'
import { PlayServer } from './play/server'
import type { ServerModule } from './types'

export const initCtx = (input: { ctx: SpaceServerCtx }): FlowServerCtx => {
  return {
    ...input.ctx,
    puzzleDb: PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: Logger({ t: 'noop' }) }),
    packDb: PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql }),
    solutions: Solutions.init,
  }
}

const init: ServerModule['init'] = {
  t: 'none',
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => updatePlay(input),
    () => updateBuilder(input),
    () => updatePackList(input),
    () => updatePackPuzzlesGrid(input),
    () => updatePuzzleList(input),
  )
}

const updatePackList: ServerModule['update'] = async (input) => {
  const updated = await PackListServer.update({
    ...input,
    msgClient: input.msgClient?.t === 'pack-list' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msg: input.msg?.t === 'pack-list' ? input.msg.c : null,
  })

  return {
    msgCmd: SpaceServerCmd.tag('pack-list', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
}

const updatePuzzleList: ServerModule['update'] = async (input) => {
  const updated = await PuzzleListServer.update({
    ...input,
    msgClient: input.msgClient?.t === 'puzzle-list' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msg: input.msg?.t === 'puzzle-list' ? input.msg.c : null,
  })

  return {
    msgCmd: SpaceServerCmd.tag('puzzle-list', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
}

const updatePackPuzzlesGrid: ServerModule['update'] = async (input) => {
  const updated = await PackPuzzlesGridServer.update({
    ...input,
    msg: input.msg?.t === 'pack-puzzles-grid' ? input.msg.c : null,
    msgClient: input.msgClient?.t === 'pack-puzzles-grid' ? { ...input.msgClient, ...input.msgClient.c } : null,
    deps: null,
  })

  return {
    msgCmd: SpaceServerCmd.tag('pack-puzzles-grid', updated.msgCmd),
    msgEvt: updated.msgEvt,
  }
}

const updateBuilder: ServerModule['update'] = async (input) => {
  const updated = await BuilderServer.update({
    ...input,
    modelCore: input.modelCore.builder,
    msgClient: input.msgClient?.t === 'builder' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: null,
  })

  return {
    msgCmd: SpaceServerCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'builder', c })),
    msgEvt: updated.msgEvt,
  }
}

const updatePlay: ServerModule['update'] = async (input) => {
  const updated = await PlayServer.update({
    ctx: input.ctx,
    modelCore: input.modelCore.play,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt,
    msgClient: input.msgClient?.t === 'play' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'play' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
    deps: null,
  })

  return {
    msgCmd: SpaceServerCmd.tag('play', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'play', c })),
    msgEvt: updated.msgEvt,
  }
}

const subscriptions: ServerModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const FlowServer = {
  init,
  subscriptions,
  update,
  initCtx,
}
