import { Eff, Sub } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { GameClientModule } from 'gamezilla-app/app/spaces/@/architecture/game-client-v2'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { FlowPackListClient } from '../@/flow-pack'
import { FlowPackPuzzlesGridClient } from '../@/flow-pack/flow-pack-puzzles-grid/flow-pack-puzzles-grid.client'
import type { ClientModule, MsgClient, MsgToServer } from './play.types'
import { ScreenPuzzleClient } from './screen-play-puzzle/screen-play-puzzle.client'
import { ScreenSelectPackClient } from './screen-select-pack/screen-select-pack.client'
import { ScreenSelectPuzzleClient } from './screen-select-puzzle/select-puzzle.client'

const init: ClientModule['init'] = {
  flowPackList: FlowPackListClient.initClient,
  flowPackPuzzleGrid: FlowPackPuzzlesGridClient.initClient,
  flowPacks: {},
  flowPuzzles: {}
}

const update = (
  input: Parameters<ClientModule['update']>[0]
): ReturnType<ClientModule['update']> & {
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
} => {
  const updatedChild = updateChild({
    ...input,
    msgCmd: null
  })

  const updated = updateLoop({ ...input, msgCmd: null }, updatedChild)

  const msgCmd = updated.msgCmd?.flatMap((msgCmd) => (msgCmd.t === 'flow-pack-puzzles-grid' ? [] : [msgCmd]))

  return {
    ...updated,
    msgCmd
  }
}

const updateLoop = (input: Parameters<ClientModule['update']>[0], acc: ReturnType<ClientModule['update']>) => {
  const [cmd, ...rest] = (acc.msgCmd ?? []).flatMap((cmd) => (cmd.t === 'flow-pack-puzzles-grid' ? [cmd] : []))

  if (cmd) {
    const updated = updateChild({
      ...input,
      model: acc.model,
      msgCmd: cmd
    })
    return updateLoop(input, {
      model: updated.model,
      msgCmd: Msg.batch(rest, updated.msgCmd),
      eff: Eff.batch([acc.eff, updated.eff]),
      msgCore: Msg.batch(input.msgCore, updated.msgCore),
      msgEvt: Msg.batch(input.msgEvt, updated.msgEvt)
    })
  }

  return acc
}

const updateChild: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => updateFlowPackList({ ...input, model }),
    (model) => updateFlowPackPuzzlesGrid({ ...input, model }),
    (model) => ScreenPuzzleClient.update({ ...input, model }),
    (model) => ScreenSelectPackClient.update({ ...input, model }),
    (model) => ScreenSelectPuzzleClient.update({ ...input, model })
  )
}

const updateFlowPackList: ClientModule['update'] = (input) => {
  const updated = FlowPackListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.flowPackList,
      packs: input.model.flowPacks
    },
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'flow-pack-list' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd
  })

  return {
    model: {
      ...input.model,
      flowPackList: {
        ...updated.model,
        packs: {}
      },
      flowPacks: updated.model.packs
    },
    eff: Eff.tag('flow-pack-list', updated.eff),
    msgEvt: updated.msgEvt,
    msgCmd: SpaceClientCmd.tag('flow-pack-list', updated.msgCmd),
    msgCore: []
  }
}

const updateFlowPackPuzzlesGrid: ClientModule['update'] = (input) => {
  const pack = 'flowPack' in input.modelCore.screen ? input.modelCore.screen.flowPack : null

  if (!pack) {
    return { model: input.model }
  }

  const updated = FlowPackPuzzlesGridClient.update({
    ctx: {
      ...input.ctx,
      pack
    },
    model: {
      ...input.model.flowPackPuzzleGrid,
      puzzles: input.model.flowPuzzles
    },
    msg: input.msg?.t === 'flow-pack-grid' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'flow-pack-grid' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd
  })
  return {
    model: {
      ...input.model,
      flowPackPuzzleGrid: {
        ...updated.model,
        puzzles: {}
      },
      flowPuzzles: updated.model.puzzles
    },
    eff: Eff.tag('flow-pack-grid', updated.eff),
    msgEvt: updated.msgEvt,
    msgCmd: SpaceClientCmd.tag('flow-pack-grid', updated.msgCmd),
    msgCore: []
  }
}

const subscriptions: ClientModule['subscriptions'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-select-puzzle':
    case 'screen-play-puzzle':
      return Sub.tag(
        'flow-pack-grid',
        FlowPackPuzzlesGridClient.subscriptions({
          ctx: {
            ...input.ctx,
            pack: input.modelCore.screen.flowPack
          },
          model: input.model.flowPackPuzzleGrid
        })
      )

    default: {
      return Sub.None
    }
  }
}

const View: ClientModule['View'] = (input) => {
  return (
    <div className='flex h-full w-full flex-col'>
      <ViewScreen {...input} />
    </div>
  )
}

const ViewScreen: ClientModule['View'] = (input) => {
  switch (input.modelCore.screen.t) {
    case 'screen-select-puzzle': {
      return <ScreenSelectPuzzleClient.View {...input} />
    }

    case 'screen-select-pack': {
      return <ScreenSelectPackClient.View {...input} />
    }

    case 'screen-play-puzzle': {
      return <ScreenPuzzleClient.View {...input} />
    }

    default: {
      return null
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = (_input) => {
  return null
}

export const PlayClient = {
  init,
  update,
  subscriptions,
  View,
  ViewFeedItem
}
