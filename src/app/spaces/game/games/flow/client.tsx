import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/client/cmd'
import { IconGamepad, IconScrewdriverWrench } from '~/app/@/ui'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { GameClientModule } from '~/app/spaces/game/games/@/architecture/game-client-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { FlowClientCmd } from './@/client/cmd'
import type { FlowClientCtx } from './@/client/ctx'
import { FlowClientEvt } from './@/client/evt'
import { CoverArt } from './@/cover-art'
import { Pack } from './@/pack/pack'
import { PackListClient, PackListTypes } from './@/pack/pack-list'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import { PackPuzzlesGridClient } from './@/pack/pack-puzzles-grid/client'
import { PuzzleListTypes } from './@/puzzle/puzzle-list'
import { PuzzleListClient } from './@/puzzle/puzzle-list/client'
import { Solutions } from './@/solutions/solutions'
import { BuilderClient } from './builder/client'
import { PlayClient } from './play/client'
import type { ClientModule, ModelClient, MsgClient, MsgToBackend } from './types'

const init: ClientModule['init'] = {
  builder: BuilderClient.init,
  play: PlayClient.init,
  puzzles: {},
  packs: {},
  solutions: Solutions.init,
  packPuzzleGrid: PackPuzzlesGridTypes.initClient,
  puzzleList: PuzzleListTypes.initClient,
  packList: PackListTypes.initClient,
}

const toFlowClientCtx = (input: Parameters<ClientModule['update']>[0]): FlowClientCtx => {
  return {
    ...input.ctx,
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid,
    solutions: input.model.solutions,
  }
}

const update = (
  input: Parameters<ClientModule['update']>[0],
): ReturnType<ClientModule['update']> & {
  msgCmd?: SpaceClientCmd<{ MsgClient: MsgClient; MsgToBackend: MsgToBackend }>[]
} => {
  const acc = updateChild(input)
  const updated = updateLoop(input, acc)
  return {
    ...updated,
    msgCmd: FlowClientCmd.toSpaceClientCmd(updated.msgCmd),
  }
}

const updateLoop = (
  input: Parameters<ClientModule['update']>[0],
  acc: ReturnType<ClientModule['update']>,
): ReturnType<ClientModule['update']> => {
  const [evt, ...restEvt] = FlowClientEvt.toFlowClientEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      modelCore: input.modelCore,
      model: acc.model,
      msgEvt: evt,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(restEvt, updated.msgEvt, FlowClientEvt.toSpaceClientEvt(acc.msgEvt)),
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
    })
  }

  const [cmd, ...restCmd] = FlowClientCmd.toFlowClientCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      modelCore: input.modelCore,
      model: acc.model,
      msgCmd: cmd,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      eff: Eff.batch(acc.eff, updated.eff),
      msgCore: Msg.batch(acc.msgCore, updated.msgCore),
      msgCmd: Msg.batch(restCmd, updated.msgCmd, FlowClientCmd.toSpaceClientCmd(acc.msgCmd)),
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
    (model) => updatePuzzleList({ ...input, model }),
  )
}

const updatePuzzleList: ClientModule['update'] = (input) => {
  const ctx = toFlowClientCtx(input)

  const updated = PuzzleListClient.update({
    ctx,
    model: input.model.packList,
    msg: input.msg?.t === 'puzzle-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'puzzle-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'puzzle-list' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, puzzleList: updated.model },
    eff: Eff.tag('puzzle-list', updated.eff),
    msgCmd: FlowClientCmd.tag('puzzle-list', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackList: ClientModule['update'] = (input) => {
  const updated = PackListClient.update({
    ctx: input.ctx,
    model: { ...input.model.packList, packs: input.model.packs },
    msg: input.msg?.t === 'pack-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'pack-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'pack-list' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, packList: updated.model, packs: updated.model.packs },
    eff: Eff.tag('pack-list', updated.eff),
    msgCmd: FlowClientCmd.tag('pack-list', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackPuzzlesGrid: ClientModule['update'] = (input) => {
  const updated = PackPuzzlesGridClient.update({
    ctx: { ...input.ctx, pack: Pack.randomSync() },
    model: { ...input.model.packPuzzleGrid, puzzles: input.model.puzzles },
    msg: input.msg?.t === 'pack-puzzles-grid' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'pack-puzzles-grid' ? input.msgBackend.c : null,
    msgEvt: input.msgEvt,
    msgCmd: input.msgCmd?.t === 'pack-puzzles-grid' ? input.msgCmd : null,
  })
  return {
    model: { ...input.model, packPuzzleGrid: updated.model, puzzles: updated.model.puzzles },
    eff: Eff.tag('pack-puzzles-grid', updated.eff),
    msgEvt: [],
    msgCmd: SpaceClientCmd.tag('pack-puzzles-grid', updated.msgCmd),
    msgCore: [],
  }
}

const updateModePlay: ClientModule['update'] = (input) => {
  const ctx = toFlowClientCtx(input)

  const updated = PlayClient.update({
    ctx,
    modelCore: input.modelCore.play,
    model: input.model.play,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'play' ? input.msgBackend.c : null,
    msgCore: input.msgCore?.t === 'play' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, play: updated.model },
    eff: Eff.tag('play', updated.eff),
    msgEvt: [],
    msgCmd: FlowClientCmd.tag('play', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'play' })),
  }
}

const updateModeBuilder: ClientModule['update'] = (input) => {
  const ctx = toFlowClientCtx(input)

  const updated = BuilderClient.update({
    ctx,
    modelCore: input.modelCore.builder,
    model: input.model.builder,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'builder' ? input.msgBackend.c : null,
    msgCore: input.msgCore?.t === 'builder' ? { ...input.msgCore, ...input.msgCore.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, builder: updated.model },
    eff: Eff.tag('builder', updated.eff),
    msgCmd: FlowClientCmd.tag('builder', updated.msgCmd),
    msgCore: updated.msgCore?.map((c) => ({ ...c, c, t: 'builder' })),
    msgEvt: [],
  }
}

const updateFromMsgCore: ClientModule['update'] = (input) => {
  switch (input.msgCore?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          play: PlayClient.init,
          builder: BuilderClient.init,
        },
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
        msgEvt: [
          {
            t: 'flow-evt.user-changed-mode',
            mode: input.msgCore.mode,
            userId: input.msgCore.userId,
          },
        ],
      }
    }

    default: {
      return {
        model: input.model,
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
        model: input.model,
      }
    }
  }
}

const updateFromCmd: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.t) {
    case 'flow-cmd.add-packs': {
      return {
        model: {
          ...input.model,
          packs: {
            ...input.model.packs,
            ...input.msgCmd.packs,
          },
        },
      }
    }

    case 'flow-cmd.add-puzzles': {
      return {
        model: {
          ...input.model,
          puzzles: {
            ...input.model.puzzles,
            ...input.msgCmd.puzzles,
          },
        },
      }
    }

    case 'flow-cmd.add-solutions': {
      return {
        model: {
          ...input.model,
          solutions: Solutions.merge(input.model.solutions, input.msgCmd.solutions),
        },
      }
    }

    case 'flow-cmd.remove-puzzles': {
      const puzzlesNew: ModelClient['puzzles'] = { ...input.model.puzzles }
      for (const id of Object.values(input.msgCmd.puzzles)) {
        delete puzzlesNew[id]
      }
      return {
        model: {
          ...input.model,
          puzzles: puzzlesNew,
        },
      }
    }

    case 'pack-list':
    case 'pack-puzzles-grid': {
      return {
        model: input.model,
      }
    }

    default: {
      return {
        model: input.model,
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
    packPuzzleGrid: input.model.packPuzzleGrid,
    solutions: input.model.solutions,
  }
  return Sub.batch<MsgClient>([
    Sub.tag('play', PlayClient.subscriptions({ ctx, modelCore: input.modelCore.play, model: input.model.play })),
    Sub.tag(
      'builder',
      BuilderClient.subscriptions({ ctx, modelCore: input.modelCore.builder, model: input.model.builder }),
    ),
    Sub.tag(
      'pack-puzzles-grid',
      PackPuzzlesGridClient.subscriptions({
        ctx: { ...ctx, pack: Pack.randomSync() },
        model: input.model.packPuzzleGrid,
      }),
    ),
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
    packPuzzleGrid: input.model.packPuzzleGrid,
    solutions: input.model.solutions,
  }

  switch (input.modelCore.mode) {
    case 'none': {
      return (
        <GameMainMenu.View
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          ctx={ctx}
          title={ctx.t('flow')}
          dispatch={input.dispatch}
          onBack={() => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' })}
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
                    userId: input.ctx.currentUserId,
                  },
                })
              },
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
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
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
          dispatch={(c) => input.dispatch({ t: 'play', c })}
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
  ViewFeedItem,
}
