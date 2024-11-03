import { Sub } from 'gamezilla-app/@/core'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { SpaceServerCmd } from '../../@/space-server-cmd'
import { FlowPackDb } from './@/pack/pack-db'
import { FlowPackListServer } from './@/pack/pack-list'
import { FlowPackPuzzlesGridServer } from './@/pack/pack-puzzles-grid/pack-puzzles-grid.server'
import { FlowPuzzleDb } from './@/puzzle/puzzle-db'
import { FlowServerCtx } from './@/flow-server-ctx'
import { BuilderServer } from './builder/server'
import type { ServerModule } from './types'
import { PlayServer } from './play/server'
import { FlowPuzzleListServer } from './@/puzzle/puzzle-list'
import { SpaceServerCtx } from '../../@/space-server-ctx'

export const initCtx = (input: { ctx: SpaceServerCtx }): FlowServerCtx => {
  return {
    ...input.ctx,
    flowPuzzleDb: FlowPuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: Logger({ t: 'noop' }) }),
    flowPackDb: FlowPackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql })
  }
}

const init: ServerModule['init'] = {
  t: 'none'
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => updatePlay(input),
    () => updateBuilder(input),
    () => updateFlowPackList(input),
    () => updateFlowPackPuzzlesGrid(input),
    () => updateFlowPuzzleList(input)
  )
}

const updateFlowPackList: ServerModule['update'] = async (input) => {
  const updated = await FlowPackListServer.update({
    ...input,
    msgClient: input.msgClient?.t === 'flow-pack-list' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null
  })

  return {
    msgCmd: SpaceServerCmd.tag('flow-pack-list', updated.msgCmd),
    msgEvt: updated.msgEvt
  }
}

const updateFlowPuzzleList: ServerModule['update'] = async (input) => {
  const updated = await FlowPuzzleListServer.update({
    ...input,
    msgClient: input.msgClient?.t === 'flow-puzzle-list' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msg: input.msg?.t === 'flow-puzzle-list' ? input.msg.c : null
  })

  return {
    msgCmd: SpaceServerCmd.tag('flow-puzzle-list', updated.msgCmd),
    msgEvt: updated.msgEvt
  }
}

const updateFlowPackPuzzlesGrid: ServerModule['update'] = async (input) => {
  const updated = await FlowPackPuzzlesGridServer.update({
    ...input,
    msg: input.msg?.t === 'flow-pack-puzzles-grid' ? input.msg.c : null,
    msgClient: input.msgClient?.t === 'flow-pack-puzzles-grid' ? { ...input.msgClient, ...input.msgClient.c } : null,
    deps: null
  })

  return {
    msgCmd: SpaceServerCmd.tag('flow-pack-puzzles-grid', updated.msgCmd),
    msgEvt: updated.msgEvt
  }
}

const updateBuilder: ServerModule['update'] = async (input) => {
  const updated = await BuilderServer.update({
    ...input,
    modelCore: input.modelCore.builder,
    msgClient: input.msgClient?.t === 'builder' ? { ...input.msgClient, ...input.msgClient.c } : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
    deps: null
  })

  return {
    msgCmd: SpaceServerCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'builder', c })),
    msgEvt: updated.msgEvt
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
    deps: null
  })

  return {
    msgCmd: SpaceServerCmd.tag('play', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, t: 'play', c })),
    msgEvt: updated.msgEvt
  }
}

const subscriptions: ServerModule['subscriptions'] = async (_input) => {
  return Sub.None
}

export const FlowServer = {
  init,
  subscriptions,
  update,
  initCtx
}
