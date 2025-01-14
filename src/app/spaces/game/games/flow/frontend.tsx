import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { IconGamepad, IconScrewdriverWrench } from '~/app/@/ui'
import { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { FlowFrontendCmd } from './@/frontend/cmd'
import type { FlowFrontendCtx } from './@/frontend/ctx'
import { FlowFrontendEvt } from './@/frontend/evt'
import { CoverArt } from './@/cover-art'
import { Pack } from './@/pack/pack'
import { PackListFrontend, PackListTypes } from './@/pack/pack-list'
import { PackPuzzlesGridTypes } from './@/pack/pack-puzzles-grid'
import { PackPuzzlesGridFrontend } from './@/pack/pack-puzzles-grid/frontend'
import { PuzzleListTypes } from './@/puzzle/puzzle-list'
import { PuzzleListFrontend } from './@/puzzle/puzzle-list/frontend'
import { Solutions } from './@/solutions/solutions'
import { BuilderFrontend } from './builder/frontend'
import { PlayFrontend } from './play/frontend'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgToBackend } from './types'

const init: FrontendModule['init'] = {
  builder: BuilderFrontend.init,
  play: PlayFrontend.init,
  puzzles: {},
  packs: {},
  solutions: Solutions.init,
  packPuzzleGrid: PackPuzzlesGridTypes.initFrontend,
  puzzleList: PuzzleListTypes.initFrontend,
  packList: PackListTypes.initFrontend,
}

const toFlowFrontendCtx = (input: Parameters<FrontendModule['update']>[0]): FlowFrontendCtx => {
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
  input: Parameters<FrontendModule['update']>[0],
): ReturnType<FrontendModule['update']> & {
  msgCmd?: SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>[]
} => {
  const acc = updateChild(input)
  const updated = updateLoop(input, acc)
  return {
    ...updated,
    msgCmd: FlowFrontendCmd.toSpaceFrontendCmd(updated.msgCmd),
  }
}

const updateLoop = (
  input: Parameters<FrontendModule['update']>[0],
  acc: ReturnType<FrontendModule['update']>,
): ReturnType<FrontendModule['update']> => {
  const [evt, ...restEvt] = FlowFrontendEvt.toFlowFrontendEvt(acc.msgEvt)

  if (evt) {
    const updated = updateChild({
      ctx: input.ctx,
      modelSpace: input.modelSpace,
      model: acc.model,
      msgEvt: evt,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(restEvt, updated.msgEvt, FlowFrontendEvt.toSpaceFrontendEvt(acc.msgEvt)),
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
    })
  }

  const [cmd, ...restCmd] = FlowFrontendCmd.toFlowFrontendCmd(acc.msgCmd)

  if (cmd) {
    const updated = updateChild({
      ctx: input.ctx,
      modelSpace: input.modelSpace,
      model: acc.model,
      msgCmd: cmd,
    })

    return updateLoop(input, {
      model: updated.model,
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt),
      eff: Eff.batch(acc.eff, updated.eff),
      msgSpace: Msg.batch(acc.msgSpace, updated.msgSpace),
      msgCmd: Msg.batch(restCmd, updated.msgCmd, FlowFrontendCmd.toSpaceFrontendCmd(acc.msgCmd)),
    })
  }

  return acc
}

const updateChild: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateModePlay({ ...input, model }),
    (model) => updateModeBuilder({ ...input, model }),
    (model) => updatePackList({ ...input, model }),
    (model) => updatePackPuzzlesGrid({ ...input, model }),
    (model) => updatePuzzleList({ ...input, model }),
  )
}

const updatePuzzleList: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PuzzleListFrontend.update({
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
    msgCmd: FlowFrontendCmd.tag('puzzle-list', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackList: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PackListFrontend.update({
    ctx,
    model: input.model.packList,
    msg: input.msg?.t === 'pack-list' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'pack-list' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'pack-list' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, packList: updated.model },
    eff: Eff.tag('pack-list', updated.eff),
    msgCmd: FlowFrontendCmd.tag('pack-list', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackPuzzlesGrid: FrontendModule['update'] = (input) => {
  const updated = PackPuzzlesGridFrontend.update({
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
    msgCmd: SpaceFrontendCmd.tag('pack-puzzles-grid', updated.msgCmd),
    msgSpace: [],
  }
}

const updateModePlay: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PlayFrontend.update({
    ctx,
    modelSpace: input.modelSpace.play,
    model: input.model.play,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'play' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'play' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'play' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, play: updated.model },
    eff: Eff.tag('play', updated.eff),
    msgEvt: [],
    msgCmd: FlowFrontendCmd.tag('play', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'play' })),
  }
}

const updateModeBuilder: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = BuilderFrontend.update({
    ctx,
    modelSpace: input.modelSpace.builder,
    model: input.model.builder,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'builder' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'builder' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'builder' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, builder: updated.model },
    eff: Eff.tag('builder', updated.eff),
    msgCmd: FlowFrontendCmd.tag('builder', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'builder' })),
    msgEvt: [],
  }
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          play: PlayFrontend.init,
          builder: BuilderFrontend.init,
        },
        msgCmd: [playSound(APP_SOUND.navForwardMin)],
        msgEvt: [
          {
            t: 'flow-evt.user-changed-mode',
            mode: input.msgSpace.mode,
            userId: input.msgSpace.userId,
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

const updateFromMsg: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'got-msg-space': {
      const msgSpace = withEventId(input.msg.c)
      return { model: input.model, msgSpace: [msgSpace] }
    }

    default: {
      return {
        model: input.model,
      }
    }
  }
}

const updateFromCmd: FrontendModule['update'] = (input) => {
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
      const puzzlesNew: ModelFrontend['puzzles'] = { ...input.model.puzzles }
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

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const ctx: FlowFrontendCtx = {
    ...input.ctx,
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid,
    solutions: input.model.solutions,
  }
  return Sub.batch<MsgFrontend>([
    Sub.tag('play', PlayFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.play, model: input.model.play })),
    Sub.tag(
      'builder',
      BuilderFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.builder, model: input.model.builder }),
    ),
    Sub.tag(
      'pack-puzzles-grid',
      PackPuzzlesGridFrontend.subscriptions({
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

const View: FrontendModule['View'] = (input) => {
  const ctx: FlowFrontendCtx = {
    ...input.ctx,
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleList: input.model.puzzleList,
    packList: input.model.packList,
    packPuzzleGrid: input.model.packPuzzleGrid,
    solutions: input.model.solutions,
  }

  switch (input.modelSpace.mode) {
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
                  t: 'got-msg-space',
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
                  t: 'got-msg-space',
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
        <BuilderFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'builder', c })}
          modelSpace={input.modelSpace.builder}
          model={input.model.builder}
        />
      )
    }

    case 'play': {
      return (
        <PlayFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'play', c })}
          modelSpace={input.modelSpace.play}
          model={input.model.play}
        />
      )
    }
  }
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = (_input) => {
  return null
}

export const FlowFrontend = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
