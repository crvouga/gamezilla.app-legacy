import { Sub } from 'gamezilla-app/@/core'
import { Logger } from 'gamezilla-app/app/@/server/logger'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowPackDb } from '../@/flow-pack/flow-pack-db'
import { FlowPackListServer } from '../@/flow-pack/flow-pack-list'
import { FlowPuzzleDb } from '../@/flow-puzzle/flow-puzzle-db'
import { FlowPuzzleListServer } from '../@/flow-puzzle/flow-puzzle-list'
import { initServer, type ServerModule } from './builder.types'
import { ScreenOpenPuzzleServer } from './screen-open-puzzle/screen-open-puzzle.server'
import { ScreenPuzzleBuilderServer } from './screen-puzzle-builder/server'
import { ScreenPackBuilderServer } from './screen-pack-builder/screen-pack-builder.server'
import { ScreenOpenPackServer } from './screen-open-pack/screen-open-pack.server'

const initDeps: ServerModule['initDeps'] = async (input) => {
  return {
    flowPuzzleDb: FlowPuzzleDb({
      t: 'db-conn-sql',
      dbConnSql: input.ctx.dbConnSql,
      logger: Logger({
        t: 'noop'
      })
    }),
    flowPackDb: FlowPackDb({
      t: 'db-conn-sql',
      dbConnSql: input.ctx.dbConnSql
    })
  }
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => ScreenPuzzleBuilderServer.update(input),
    () => ScreenOpenPuzzleServer.update(input),
    () => ScreenOpenPackServer.update(input),
    () => ScreenPackBuilderServer.update(input),
    () => updateFlowPackList(input),
    () => updateFlowPuzzleList(input)
  )
}

const updateFlowPuzzleList: ServerModule['update'] = async (input) => {
  const updated = await FlowPuzzleListServer.update({
    ...input,
    msg: input.msg?.t === 'flow-puzzle-list' ? input.msg.c : undefined,
    msgClient:
      input.msgClient?.t === 'flow-puzzle-list'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : undefined
  })

  return {
    msgCmd: SpaceServerCmd.tag('flow-puzzle-list', updated.msgCmd)
  }
}

const updateFlowPackList: ServerModule['update'] = async (input) => {
  const updated = await FlowPackListServer.update({
    ...input,
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : undefined,
    msgClient:
      input.msgClient?.t === 'flow-pack-list'
        ? {
            ...input.msgClient,
            ...input.msgClient.c
          }
        : undefined
  })
  return {
    msgCmd: SpaceServerCmd.tag('flow-pack-list', updated.msgCmd)
  }
}

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const BuilderServer: ServerModule = {
  initDeps: initDeps,
  init: initServer,
  update,
  subscriptions
}
