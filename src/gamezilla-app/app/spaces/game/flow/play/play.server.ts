import { Eff, Sub } from 'gamezilla-app/@/core'
import { ILogger } from 'gamezilla-app/app/@/server/logger'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { SpaceServerCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowPackDb, FlowPackListServer, IFlowPackDb } from '../@/flow-pack'
import { FlowPackPuzzlesGridServer } from '../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.server'
import { FlowPuzzleDb, IFlowPuzzleDb } from '../@/flow-puzzle'
import type { ModelCore, ModelServer, MsgCore, MsgServer, MsgToClient, MsgToServer } from './play.types'

type ServerModule = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgCore: MsgCore
  ModelCore: ModelCore
  Ctx: SpaceServerCtx
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  Deps: {
    flowPackDb: IFlowPackDb
    flowPuzzleDb: IFlowPuzzleDb
  }
}>

const init: ServerModule['init'] = async () => {
  return {
    model: {}
  }
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    { model: input.model },
    (model) =>
      updateFlowPackList({
        ...input,
        model
      }),
    (model) =>
      updateFlowPackGrid({
        ...input,
        model
      })
  )
}

const updateFlowPackList: ServerModule['update'] = async (input) => {
  const updated = await FlowPackListServer.update({
    ctx: input.ctx,
    deps: input.deps,
    model: null,
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null,
    msgClient:
      input.msgClient?.t === 'flow-pack-list'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : null,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt
  })
  return {
    model: input.model,
    eff: Eff.tag('flow-pack-list', updated.eff),
    msgCmd: SpaceServerCmd.tag('flow-pack-list', updated.msgCmd),
    msgCore: [],
    msgEvt: updated.msgEvt
  }
}

const updateFlowPackGrid: ServerModule['update'] = async (input) => {
  const updated = await FlowPackPuzzlesGridServer.update({
    ctx: input.ctx,
    deps: input.deps,
    model: {},
    msg: input.msg?.t === 'flow-pack-grid' ? input.msg.c : null,
    msgClient:
      input.msgClient?.t === 'flow-pack-grid'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : null,
    msgCmd: input.msgCmd,
    msgEvt: input.msgEvt
  })

  return {
    model: input.model,
    eff: Eff.tag('flow-pack-grid', updated.eff),
    msgCmd: SpaceServerCmd.tag('flow-pack-grid', updated.msgCmd),
    msgCore: [],
    msgEvt: updated.msgEvt
  }
}

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const PlayServer: ServerModule = {
  init,
  update,
  subscriptions,
  deps: async (input) => {
    return {
      flowPackDb: FlowPackDb({
        t: 'db-conn-sql',
        dbConnSql: input.ctx.dbConnSql
      }),
      flowPuzzleDb: FlowPuzzleDb({
        t: 'db-conn-sql',
        dbConnSql: input.ctx.dbConnSql,
        logger: ILogger.prefix('flow-puzzle-db', input.ctx.logger)
      })
    }
  }
}
