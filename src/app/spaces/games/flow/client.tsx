import { unwrap } from '~/@/result'
import { Msg } from '~/@/msg/msg'
import { withEventId } from '~/@/event-sourced/event'
import { Posix } from '~/@/time/posix'
import { APP_SOUND, playSound } from '~/app/@/client'
import { IconGamepad, IconScrewdriverWrench } from '~/app/@/ui'
import { GameClientModule } from '~/app/spaces/games/@/architecture/game-client-v2'
import { SpaceClientCmd } from '../../@/space-client-cmd'
import { GameMainMenu } from '../@/game/game-main-menu'
import { FlowClientCmd } from './@/client/cmd'
import type { FlowClientCtx } from './@/client/ctx'
import { FlowClientEvt } from './@/client/evt'
import { CoverArt } from './@/cover-art'
import { Pack } from './@/pack/pack'
import { PackId } from './@/pack/pack-id'
import { PackListClient, PackListTypes } from './@/pack/pack-list'
import { PackName } from './@/pack/pack-name'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import { PackPuzzlesGridClient } from './@/pack/pack-puzzles-grid/client'
import { PuzzleListClient, PuzzleListTypes } from './@/puzzle/puzzle-list'
import { BuilderClient } from './builder/client'
import { PlayClient } from './play/client'
import type { ClientModule, ModelClient, MsgClient, MsgToServer } from './types'
import { Eff } from '~/@/program/eff'
import { Sub } from '~/@/sub'

const init: ClientModule['init'] = {
  builder: BuilderClient.init,
  play: PlayClient.init,
  puzzles: {},
  packs: {},
  solutions: {},
  packPuzzleGrid: PackPuzzlesGridTypes.initClient,
  puzzleList: PuzzleListTypes.initClient,
  packList: PackListTypes.initClient
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
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateModePlay({ ...input, model }),
    (model) => updateModeBuilder({ ...input, model }),
    (model) => updatePackList({ ...input, model }),
    (model) => updatePackPuzzlesGrid({ ...input, model }),
    (model) => updatePuzzleList({ ...input, model })
  )
}

const updatePuzzleList: ClientModule['update'] = (input) => {
  const updated = PuzzleListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.packList,
      puzzles: input.model.puzzles
    },
    msg: input.msg?.t === 'flow-puzzle-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'flow-puzzle-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'flow-puzzle-list' ? input.msgServer.c : null
  })

  return {
    model: {
      ...input.model,
      puzzleList: updated.model,
      puzzles: updated.model.puzzles
    },
    eff: Eff.tag('flow-puzzle-list', updated.eff),
    msgCmd: FlowClientCmd.tag('flow-puzzle-list', updated.msgCmd),
    msgEvt: []
  }
}

const updatePackList: ClientModule['update'] = (input) => {
  const updated = PackListClient.update({
    ctx: input.ctx,
    model: {
      ...input.model.packList,
      packs: input.model.packs
    },
    msg: input.msg?.t === 'flow-pack-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'flow-pack-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'flow-pack-list' ? input.msgServer.c : null
  })

  return {
    model: {
      ...input.model,
      packList: updated.model,
      packs: updated.model.packs
    },
    eff: Eff.tag('flow-pack-list', updated.eff),
    msgCmd: FlowClientCmd.tag('flow-pack-list', updated.msgCmd),
    msgEvt: []
  }
}

const updatePackPuzzlesGrid: ClientModule['update'] = (input) => {
  const updated = PackPuzzlesGridClient.update({
    ctx: {
      ...input.ctx,
      pack: {
        createdAt: Posix.now(),
        createdBy: input.ctx.currentUserId,
        id: PackId.generate(),
        lastUpdatedAt: Posix.now(),
        lastUpdatedBy: input.ctx.currentUserId,
        name: unwrap(PackName.parse('New Pack')),
        puzzleIds: []
      }
    },
    model: {
      ...input.model.packPuzzleGrid,
      puzzles: input.model.puzzles
    },
    msg: input.msg?.t === 'flow-pack-puzzles-grid' ? input.msg.c : null,
    msgServer: input.msgServer?.t === 'flow-pack-puzzles-grid' ? input.msgServer.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'flow-pack-puzzles-grid' ? input.msgCmd : null
  })
  return {
    model: {
      ...input.model,
      packPuzzleGrid: updated.model,
      puzzles: updated.model.puzzles
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
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid
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
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid
  }

  const updated = BuilderClient.update({
    ctx,
    modelCore: input.modelCore.builder,
    model: input.model.builder,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgServer: input.msgServer?.t === 'builder' ? input.msgServer.c : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null
  })

  return {
    eff: Eff.tag('builder', updated.eff),
    msgCmd: FlowClientCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'builder' })),
    msgEvt: [],
    model: {
      ...input.model,
      builder: updated.model
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
    case 'got-msg-core': {
      const msgCore = withEventId(input.msg.c)
      return { model: input.model, msgCore: [msgCore] }
    }

    default: {
      return {
        model: input.model
      }
    }
  }
}

const updateFromCmd: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.t) {
    case 'flow.new-packs': {
      return {
        model: {
          ...input.model,
          packs: {
            ...input.model.packs,
            ...input.msgCmd.packs
          }
        }
      }
    }

    case 'flow.new-puzzles': {
      return {
        model: {
          ...input.model,
          puzzles: {
            ...input.model.puzzles,
            ...input.msgCmd.puzzles
          }
        }
      }
    }

    case 'flow.remove-puzzles': {
      const puzzlesNew: ModelClient['puzzles'] = { ...input.model.puzzles }
      for (const id of Object.values(input.msgCmd.puzzles)) {
        delete puzzlesNew[id]
      }
      return {
        model: {
          ...input.model,
          puzzles: puzzlesNew
        }
      }
    }

    case 'flow-pack-list':
    case 'flow-pack-puzzles-grid': {
      return {
        model: input.model
      }
    }

    case 'flow.new-solutions': {
      return {
        model: {
          ...input.model,
          solutions: {
            ...input.model.solutions,
            ...input.msgCmd.solutions
          }
        }
      }
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
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid
  }
  return Sub.batch<MsgClient>([
    Sub.tag('play', PlayClient.subscriptions({ ctx, modelCore: input.modelCore.play, model: input.model.play })),
    Sub.tag(
      'builder',
      BuilderClient.subscriptions({ ctx, modelCore: input.modelCore.builder, model: input.model.builder })
    ),
    Sub.tag(
      'flow-pack-puzzles-grid',
      PackPuzzlesGridClient.subscriptions({
        ctx: { ...ctx, pack: Pack.randomSync() },
        model: input.model.packPuzzleGrid
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
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid
  }

  switch (input.modelCore.mode) {
    case 'none': {
      return (
        <GameMainMenu.View
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          ctx={ctx}
          title={ctx.t('flow')}
          dispatch={input.dispatch}
          onBack={() => input.dispatch({ t: 'game-main-menu/clicked-exit-game-button' })}
          buttons={[
            {
              renderIcon: (input) => <IconGamepad {...input} />,
              title: ctx.t('flow.play'),
              description: ctx.t('flow.play-description'),
              onClick: () => {
                input.dispatch({
                  t: 'got-msg-core',
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
                  t: 'got-msg-core',
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
          model={input.model.builder}
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
