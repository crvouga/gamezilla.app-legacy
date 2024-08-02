import { Eff, Sub } from 'gamezilla-app/@/core'
import { GameClientModule } from 'gamezilla-app/app/spaces/@/architecture/game-client-v2'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { FlowPackListClient } from '../@/flow-pack/flow-pack-list'
import { FlowPuzzleListClient } from '../@/flow-puzzle/flow-puzzle-list'
import { initClient, type ClientModule } from './builder.types'
import { ListTabsClient } from './list-tabs/list-tabs.client'
import { ScreenOpenPackClient } from './screen-open-pack/screen-open-pack.client'
import { ScreenPackBuilderClient } from './screen-pack-builder/screen-pack-builder.client'
import { ScreenOpenPuzzleClient } from './screen-open-puzzle/screen-open-puzzle.client'
import { ScreenPuzzleBuilderClient } from './screen-puzzle-builder/client'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) =>
      updateFlowPuzzleList({
        ...input,
        model
      }),
    (model) =>
      updateFlowPackList({
        ...input,
        model
      }),
    (model) =>
      ScreenOpenPackClient.update({
        ...input,
        model
      }),
    (model) =>
      ScreenPackBuilderClient.update({
        ...input,
        model
      }),
    (model) =>
      ScreenPuzzleBuilderClient.update({
        ...input,
        model
      }),
    (model) =>
      ScreenOpenPuzzleClient.update({
        ...input,
        model
      }),
    (model) =>
      ListTabsClient.update({
        ...input,
        model
      })
  )
}

const updateFlowPackList: ClientModule['update'] = (input) => {
  const updated = FlowPackListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.flowPackList,
      packs: input.model.packs
    },
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : undefined,
    msgServer: input.msgServer?.t === 'flow-pack-list' ? input.msgServer.c : undefined,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd
  })
  return {
    model: {
      ...input.model,
      flowPackList: updated.model,
      packs: updated.model.packs
    },
    eff: Eff.tag('flow-pack-list', updated.eff),
    msgEvt: [],
    msgCore: [],
    msgCmd: SpaceClientCmd.map(
      updated.msgCmd,
      (c) => ({
        t: 'flow-pack-list',
        c
      }),
      (c) => ({
        t: 'flow-pack-list',
        c
      })
    )
  }
}

const updateFlowPuzzleList: ClientModule['update'] = (input) => {
  const updated = FlowPuzzleListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.flowPuzzleList,
      puzzles: input.model.puzzles
    },
    msg: input.msg?.t === 'flow-puzzle-list' ? input.msg.c : undefined,
    msgServer: input.msgServer?.t === 'flow-puzzle-list' ? input.msgServer.c : undefined,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd
  })
  return {
    model: {
      ...input.model,
      flowPuzzleList: updated.model,
      puzzles: updated.model.puzzles
    },
    eff: Eff.tag('flow-puzzle-list', updated.eff),
    msgEvt: [],
    msgCore: [],
    msgCmd: SpaceClientCmd.map(
      updated.msgCmd,
      (c) => ({
        t: 'flow-puzzle-list',
        c
      }),
      (c) => ({
        t: 'flow-puzzle-list',
        c
      })
    )
  }
}

const View: ClientModule['View'] = (input) => {
  const { modelCore } = input

  switch (modelCore.opened.t) {
    case 'puzzle-builder': {
      return <ScreenPuzzleBuilderClient.View {...input} />
    }

    case 'pack-builder': {
      return <ScreenPackBuilderClient.View {...input} />
    }

    case 'list': {
      return <ListTabsClient.View {...input} />
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = () => {
  return <div />
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return Sub.batch([
    //
    ScreenOpenPuzzleClient.subscriptions(input),
    ScreenPackBuilderClient.subscriptions(input),
    Sub.tag(
      'flow-pack-list',
      FlowPackListClient.subscriptions({
        ctx: input.ctx,
        model: input.model.flowPackList
      })
    )
  ])
}

export const BuilderClient: ClientModule = {
  init: initClient,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
