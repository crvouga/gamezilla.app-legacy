import { Eff, Posix, Sub, unwrap } from 'gamezilla-app/@/core'
import { Msg } from 'gamezilla-app/@/core/msg'
import { APP_SOUND, playSound } from 'gamezilla-app/app/@/client'
import { IconGamepad, IconScrewdriverWrench } from 'gamezilla-app/app/@/ui'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { GameClientModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-client-v2'
import { GameMainMenu } from 'gamezilla-app/app/spaces/game/@/game'
import { SpaceClientCmd } from '../../@/space-client-cmd'
import { FlowClientCmd } from './@/flow-client-cmd'
import type { FlowClientCtx } from './@/flow-client-ctx'
import { FlowClientEvt } from './@/flow-client-evt'
import { CoverArt } from './@/flow-cover-art'
import { FlowPackId } from './@/pack/pack-id'
import { FlowPackListTypes, PackListClient } from './@/pack/pack-list'
import { FlowPackName } from './@/pack/pack-name'
import { FlowPackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import { FlowPackPuzzlesGridClient } from './@/pack/pack-puzzles-grid/pack-puzzles-grid.client'
import { FlowPuzzleListTypes } from './@/puzzle/puzzle-list'
import { BuilderClient } from './builder/client'
import type { ClientModule, MsgClient, MsgToServer } from './flow.types'
import { PlayClient } from './play/play.client'

const init: ClientModule['init'] = {
  builder: BuilderClient.init,
  play: PlayClient.init,
  flowPuzzles: {},
  flowPacks: {},
  flowPackPuzzleGrid: FlowPackPuzzlesGridTypes.initClient,
  flowPuzzleList: FlowPuzzleListTypes.initClient,
  flowPackList: FlowPackListTypes.initClient
}

const update = (
  input: Parameters<ClientModule['update']>[0]
): ReturnType<ClientModule['update']> & {
  msgCmd?: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>[]
} => {
  const acc = updateChild(input)
  const updated = updateLoop(input, acc)
  return {
    ...updated,
    msgCmd: FlowClientCmd.toSpaceClientCmd(updated.msgCmd)
  }
}

const updateLoop = (
  input: Parameters<ClientModule['update']>[0],
  acc: ReturnType<ClientModule['update']>
): ReturnType<ClientModule['update']> => {
  const [evt, ...restEvt] = FlowClientEvt.toFlowClientEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      modelCore: input.modelCore,
      model: acc.model,
      msgEvt: evt
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(restEvt, updated.msgEvt, FlowClientEvt.toSpaceClientEvt(acc.msgEvt)),
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd)
    })
  }

  const [cmd, ...restCmd] = FlowClientCmd.toFlowClientCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      modelCore: input.modelCore,
      model: acc.model,
      msgCmd: cmd
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(restCmd, updated.msgCmd, FlowClientCmd.toSpaceClientCmd(acc.msgCmd))
    })
  }

  return acc
}

const updateChild: ClientModule['update'] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgCore({ ...input, model }),
    (model) => updateModePlay({ ...input, model }),
    (model) => updateModeBuilder({ ...input, model }),
    (model) => updateFlowPackList({ ...input, model }),
    (model) => updateFlowPackPuzzlesGrid({ ...input, model })
  )
}

const updateFlowPackList: ClientModule['update'] = (input) => {
  const updated = PackListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.flowPackList,
      packs: input.model.flowPacks
    },
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'flow-pack-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'flow-pack-list' ? input.msgServer.c : null
  })

  return {
    model: {
      ...input.model,
      flowPackList: updated.model,
      flowPacks: updated.model.packs
    },
    eff: Eff.tag('flow-pack-list', updated.eff),
    msgCmd: FlowClientCmd.tag('flow-pack-list', updated.msgCmd),
    msgEvt: []
  }
}

const updateFlowPackPuzzlesGrid: ClientModule['update'] = (input) => {
  const updated = FlowPackPuzzlesGridClient.update({
    ctx: {
      ...input.ctx,
      pack: {
        createdAt: Posix.now(),
        createdBy: input.ctx.currentUserId,
        id: FlowPackId.generate(),
        lastUpdatedAt: Posix.now(),
        lastUpdatedBy: input.ctx.currentUserId,
        name: unwrap(FlowPackName.parse('New Pack')),
        puzzleIds: []
      }
    },
    model: {
      ...input.model.flowPackPuzzleGrid,
      puzzles: input.model.flowPuzzles
    },
    msg: input.msg?.t === 'flow-pack-puzzles-grid' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'flow-pack-puzzles-grid' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'flow-pack-puzzles-grid' ? input.msgCmd : null
  })
  return {
    model: {
      ...input.model,
      flowPackPuzzleGrid: updated.model,
      flowPuzzles: updated.model.puzzles
    },
    eff: Eff.tag('flow-pack-puzzles-grid', updated.eff),
    msgEvt: [],
    msgCmd: SpaceClientCmd.tag('flow-pack-puzzles-grid', updated.msgCmd),
    msgCore: []
  }
}

const updateModePlay: ClientModule['update'] = (input) => {
  const ctx: FlowClientCtx = {
    ...input.ctx,
    packs: input.model.flowPacks,
    puzzles: input.model.flowPuzzles,
    puzzleList: input.model.flowPuzzleList,
    packList: input.model.flowPackList,
    packPuzzleGrid: input.model.flowPackPuzzleGrid
  }

  const updated = PlayClient.update({
    ctx,
    modelCore: input.modelCore.play,
    model: input.model.play,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'play' ? input.msgServer.c : null,
    msgCore: input.msgCore?.t === 'play' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null
  })

  return {
    eff: Eff.tag('play', updated.eff),
    msgEvt: [],
    msgCmd: FlowClientCmd.tag('play', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'play' })),
    model: {
      ...input.model,
      play: updated.model
    }
  }
}

const updateModeBuilder: ClientModule['update'] = (input) => {
  const ctx: FlowClientCtx = {
    ...input.ctx,
    packs: input.model.flowPacks,
    puzzles: input.model.flowPuzzles,
    puzzleList: input.model.flowPuzzleList,
    packList: input.model.flowPackList,
    packPuzzleGrid: input.model.flowPackPuzzleGrid
  }
  const updated = BuilderClient.update({
    ctx,
    modelCore: input.modelCore.builder,
    model: {
      ...input.model.builder,
      packs: input.model.flowPacks,
      puzzles: input.model.flowPuzzles
    },
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'builder' ? input.msgServer.c : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null
  })

  return {
    eff: Eff.tag('builder', updated.eff),
    msgCmd: SpaceClientCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'builder' })),
    msgEvt: [],
    model: {
      ...input.model,
      builder: updated.model,
      flowPacks: updated.model.packs,
      flowPuzzles: updated.model.puzzles
    }
  }
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          play: PlayClient.init,
          builder: BuilderClient.init
        },
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
        msgEvt: [
          {
            t: 'flow.user-changed-mode',
            mode: input.msgCore.mode,
            userId: input.msgCore.userId
          }
        ]
      }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFromMsg: ClientModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'msgCore': {
      const msgCore = withId(input.msg.c)
      return { model: input.model, msgCore: [msgCore] }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

//
//
//
//
//
//
//
//

const subscriptions: ClientModule['subscriptions'] = (input) => {
  const ctx: FlowClientCtx = {
    ...input.ctx,
    packs: input.model.flowPacks,
    puzzles: input.model.flowPuzzles,
    puzzleList: input.model.flowPuzzleList,
    packList: input.model.flowPackList,
    packPuzzleGrid: input.model.flowPackPuzzleGrid
  }
  return Sub.batch<MsgClient>([
    Sub.tag('play', PlayClient.subscriptions({ ctx, modelCore: input.modelCore.play, model: input.model.play })),
    Sub.tag(
      'builder',
      BuilderClient.subscriptions({ ctx, modelCore: input.modelCore.builder, model: input.model.builder })
    ),
    Sub.tag(
      'flow-pack-puzzles-grid',
      FlowPackPuzzlesGridClient.subscriptions({
        ctx: {
          ...ctx,
          pack: {
            createdAt: Posix.now(),
            createdBy: ctx.currentUserId,
            id: FlowPackId.generate(),
            lastUpdatedAt: Posix.now(),
            lastUpdatedBy: ctx.currentUserId,
            name: unwrap(FlowPackName.parse('New Pack')),
            puzzleIds: []
          }
        },
        model: input.model.flowPackPuzzleGrid
      })
    )
  ])
}

//
//
// View
//
//

const View: ClientModule['View'] = (input) => {
  const ctx: FlowClientCtx = {
    ...input.ctx,
    packs: input.model.flowPacks,
    puzzles: input.model.flowPuzzles,
    puzzleList: input.model.flowPuzzleList,
    packList: input.model.flowPackList,
    packPuzzleGrid: input.model.flowPackPuzzleGrid
  }

  switch (input.modelCore.mode) {
    case null: {
      return (
        <GameMainMenu.View
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          ctx={ctx}
          title={ctx.t('flow')}
          dispatch={input.dispatch}
          buttons={[
            {
              renderIcon: (input) => <IconGamepad {...input} />,
              title: ctx.t('flow.play'),
              description: ctx.t('flow.play-description'),
              onClick: () => {
                input.dispatch({
                  t: 'msgCore',
                  c: {
                    t: 'user-changed-mode',
                    mode: 'play',
                    userId: input.ctx.currentUserId
                  }
                })
              }
            },
            {
              renderIcon: (input) => <IconScrewdriverWrench {...input} />,
              title: ctx.t('flow.builder'),
              description: ctx.t('flow.builder-description'),
              onClick: () => {
                input.dispatch({
                  t: 'msgCore',
                  c: {
                    t: 'user-changed-mode',
                    mode: 'builder',
                    userId: input.ctx.currentUserId
                  }
                })
              }
            }
          ]}
        />
      )
    }

    case 'builder': {
      return (
        <BuilderClient.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'builder', c })}
          modelCore={input.modelCore.builder}
          model={{
            ...input.model.builder,
            packs: input.model.flowPacks,
            puzzles: input.model.flowPuzzles
          }}
        />
      )
    }

    case 'play': {
      return (
        <PlayClient.View
          ctx={ctx}
          dispatch={(c) => {
            input.dispatch({
              t: 'play',
              c
            })
          }}
          modelCore={input.modelCore.play}
          model={input.model.play}
        />
      )
    }
  }
}

const ViewFeedItem: ClientModule['ViewFeedItem'] = (_input) => {
  return null
}

export const FlowClient = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem
}
