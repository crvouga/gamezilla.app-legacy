import { Sub } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowPackListServer } from '../@/flow-pack'
import { FlowPackPuzzlesGridServer } from '../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.server'
import { ServerModule } from './play.types'
import * as ScreenPlayPuzzleServer from './screen-play-puzzle/screen-play-puzzle.server'

const init: ServerModule['init'] = async () => {
  return {
    model: {}
  }
}

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen(
    {},
    () => updateFlowPackList(input),
    () => updateFlowPackGrid(input),
    () => ScreenPlayPuzzleServer.update(input)
  )
}

const updateFlowPackList: ServerModule['update'] = async (input) => {
  const updated = await FlowPackListServer.update({
    ctx: input.ctx,
    deps: input.deps,
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
    msgCmd: SpaceServerCmd.tag('flow-pack-list', updated.msgCmd),
    msgCore: [],
    msgEvt: updated.msgEvt
  }
}

const updateFlowPackGrid: ServerModule['update'] = async (input) => {
  const updated = await FlowPackPuzzlesGridServer.update({
    ctx: input.ctx,
    deps: null,
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
    msgCmd: SpaceServerCmd.tag('flow-pack-grid', updated.msgCmd),
    msgCore: [],
    msgEvt: updated.msgEvt
  }
}

const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const PlayServer = {
  init,
  update,
  subscriptions
}
