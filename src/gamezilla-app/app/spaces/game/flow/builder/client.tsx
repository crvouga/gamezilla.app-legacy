import { Eff, Sub } from 'gamezilla-app/@/core'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { PackListClient } from '../@/pack/pack-list'
import { FlowPuzzleListClient } from '../@/puzzle/puzzle-list'
import { ScreenMainMenuClient } from './screen-main-menu/client'
import { ScreenPackBuilderOpenClient } from './screen-pack-builder-open/client'
import { ScreenPuzzleBuilderOpenClient } from './screen-puzzle-builder-open/client'
import { ScreenPackBuilderClient } from './screen-pack-builder/client'
import { ScreenPuzzleBuilderClient } from './screen-puzzle-builder/client'
import { initClient, type ClientModule } from './types'
import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'

const update: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFlowPuzzleList({ ...input, model }),
    (model) => updateFlowPackList({ ...input, model }),
    (model) => ScreenPackBuilderOpenClient.update({ ...input, model }),
    (model) => ScreenPackBuilderClient.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderClient.update({ ...input, model }),
    (model) => ScreenPuzzleBuilderOpenClient.update({ ...input, model }),
    (model) => ScreenMainMenuClient.update({ ...input, model }),
    (model) => updateGotMsgCore({ ...input, model }),
    (model) => updateBackButton({ ...input, model })
  )
}

const updateBackButton: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-clicked-back-button': {
      return {
        model: input.model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateGotMsgCore: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-core': {
      return {
        model: input.model,
        msgCore: [input.msg.c]
      }
    }
    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFlowPackList: ClientModule['update'] = (input) => {
  const updated = PackListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.flowPackList,
      packs: input.model.packs
    },
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : undefined,
    msgServer: input.msgServer?.t === 'flow-pack-list' ? input.msgServer.c : undefined,
    msgEvt: input.msgEvt,
    msgCmd: null
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
      (c) => ({ t: 'flow-pack-list', c }),
      (c) => ({ t: 'flow-pack-list', c })
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
      (c) => ({ t: 'flow-puzzle-list', c }),
      (c) => ({ t: 'flow-puzzle-list', c })
    )
  }
}

const View: ClientModule['View'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-main-menu': {
      return <ScreenMainMenuClient.View {...input} />
    }

    case 'screen-puzzle-builder': {
      return <ScreenPuzzleBuilderClient.View {...input} />
    }

    case 'screen-pack-builder': {
      return <ScreenPackBuilderClient.View {...input} />
    }

    case 'screen-pack-builder-open': {
      return <ScreenPackBuilderOpenClient.View {...input} />
    }

    case 'screen-puzzle-builder-open': {
      return <ScreenPuzzleBuilderOpenClient.View {...input} />
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = () => {
  return <div />
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return Sub.batch([
    //
    ScreenPuzzleBuilderOpenClient.subscriptions(input),
    ScreenPackBuilderClient.subscriptions(input),
    Sub.tag(
      'flow-pack-list',
      PackListClient.subscriptions({
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
