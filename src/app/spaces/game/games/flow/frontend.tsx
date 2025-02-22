import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { IconGamepad, IconScrewdriverWrench } from '~/@/ui'
import { APP_SOUND, playSound } from '~/app/@/frontend/cmd'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/cover-art'
import { FlowFrontendCmd } from './@/frontend/cmd'
import type { FlowFrontendCtx } from './@/frontend/ctx'
import { FlowFrontendEvt } from './@/frontend/evt'
import { IPackDb, PackDb } from './@/pack/pack-db'
import { PackLoaderTypes } from './@/pack/pack-loader'
import { PackLoaderFrontend } from './@/pack/pack-loader/frontend'
import { IPuzzleDb, PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleLoaderTypes } from './@/puzzle/puzzle-loader'
import { PuzzleLoaderFrontend } from './@/puzzle/puzzle-loader/frontend'
import { Solutions } from './@/solutions/solutions'
import { SolutionsDb } from './@/solutions/solutions-db/impl'
import { ISolutionsDb } from './@/solutions/solutions-db/interface'
import { BuildFrontend } from './screen-build/frontend'
import { PlayFrontend } from './screen-play/frontend'
import type { FrontendModule, ModelFrontend, MsgFrontend, MsgToBackend } from './types'

const init: FrontendModule['init'] = {
  screenBuild: BuildFrontend.init,
  screenPlay: PlayFrontend.init,
  puzzleLoader: PuzzleLoaderTypes.initFrontend,
  packLoader: PackLoaderTypes.initFrontend,
  puzzles: {},
  packs: {},
  solutions: {},
}

let puzzleDb: IPuzzleDb
let packDb: IPackDb
let solutionsDb: ISolutionsDb
const toFlowFrontendCtx = (input: Parameters<FrontendModule['update']>[0]): FlowFrontendCtx => {
  puzzleDb ??= PuzzleDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger })
  packDb ??= PackDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql, logger: input.ctx.logger })
  solutionsDb ??= SolutionsDb({ t: 'db-conn-sql', dbConnSql: input.ctx.dbConnSql })
  return {
    ...input.ctx,
    puzzleDb,
    packDb,
    solutionsDb,
    packs: input.model.packs,
    puzzles: input.model.puzzles,
    puzzleLoader: input.model.puzzleLoader,
    packLoader: input.model.packLoader,
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
    (model) => updatePackDbQuery({ ...input, model }),
    (model) => updatePuzzleLoader({ ...input, model }),
  )
}

const updatePuzzleLoader: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PuzzleLoaderFrontend.update({
    ctx,
    model: input.model.puzzleLoader,
    msg: input.msg?.t === 'got-puzzle-loader-msg' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'got-puzzle-loader-cmd' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
  })

  return {
    model: { ...input.model, puzzleLoader: updated.model },
    eff: Eff.tag('got-puzzle-loader-msg', updated.eff),
    msgCmd: FlowFrontendCmd.tag('got-puzzle-loader-msg', updated.msgCmd),
    msgEvt: [],
  }
}

const updatePackDbQuery: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PackLoaderFrontend.update({
    ctx,
    model: input.model.packLoader,
    msg: input.msg?.t === 'got-pack-loader-msg' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'got-pack-loader-cmd' ? input.msgCmd : null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'got-pack-loader-msg' ? input.msgBackend.c : null,
  })

  return {
    model: { ...input.model, packLoader: updated.model },
    eff: Eff.tag('got-pack-loader-msg', updated.eff),
    msgCmd: FlowFrontendCmd.tag('got-pack-loader-msg', updated.msgCmd),
    msgEvt: [],
  }
}

const updateModePlay: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PlayFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenPlay,
    model: input.model.screenPlay,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'got-msg-play' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-msg-play' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-msg-play' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenPlay: updated.model },
    eff: Eff.tag('got-msg-play', updated.eff),
    msgEvt: [],
    msgCmd: FlowFrontendCmd.tag('got-msg-play', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-msg-play' })),
  }
}

const updateModeBuilder: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = BuildFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenBuild,
    model: input.model.screenBuild,
    msgCmd: null,
    msgEvt: input.msgEvt,
    msgBackend: input.msgBackend?.t === 'got-msg-build' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-msg-build' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-msg-build' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenBuild: updated.model },
    eff: Eff.tag('got-msg-build', updated.eff),
    msgCmd: FlowFrontendCmd.tag('got-msg-build', updated.msgCmd),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-msg-build' })),
    msgEvt: [],
  }
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          screenPlay: PlayFrontend.init,
          screenBuild: BuildFrontend.init,
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
  switch (input.modelSpace.mode) {
    case 'build': {
      const ctx = toFlowFrontendCtx(input)
      return Sub.tag(
        'got-msg-build',
        BuildFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.screenBuild, model: input.model.screenBuild }),
      )
    }

    case 'play': {
      const ctx = toFlowFrontendCtx(input)
      return Sub.tag(
        'got-msg-play',
        PlayFrontend.subscriptions({ ctx, modelSpace: input.modelSpace.screenPlay, model: input.model.screenPlay }),
      )
    }

    case 'none': {
      return Sub.None
    }
  }
}

//
//
// View
//
//

const View: FrontendModule['View'] = (input) => {
  switch (input.modelSpace.mode) {
    case 'none': {
      return <ViewMainMenu {...input} />
    }

    case 'build': {
      const ctx = toFlowFrontendCtx(input)

      return (
        <BuildFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-msg-build', c })}
          modelSpace={input.modelSpace.screenBuild}
          model={input.model.screenBuild}
        />
      )
    }

    case 'play': {
      const ctx = toFlowFrontendCtx(input)
      return (
        <PlayFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-msg-play', c })}
          modelSpace={input.modelSpace.screenPlay}
          model={input.model.screenPlay}
        />
      )
    }
  }
}

const ViewMainMenu: FrontendModule['View'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  return (
    <GameMainMenu.View
      renderCoverArt={(input) => <CoverArt {...input} />}
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
              c: { t: 'user-changed-mode', mode: 'play', userId: input.ctx.currentUserId },
            })
          },
        },
        {
          renderIcon: (input) => <IconScrewdriverWrench {...input} />,
          title: ctx.t('flow.build'),
          description: ctx.t('flow.build-description'),
          onClick: () => {
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'user-changed-mode', mode: 'build', userId: input.ctx.currentUserId },
            })
          },
        },
      ]}
    />
  )
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
