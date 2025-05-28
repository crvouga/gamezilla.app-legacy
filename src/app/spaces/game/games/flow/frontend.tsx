import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { IconGamepad } from '~/@/ui/icon/icon-gamepad'
import { IconScrewdriverWrench } from '~/@/ui/icon/icon-screwdriver-wrench'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/cover-art'
import { AddPacksCmd } from './@/frontend/add-packs-cmd'
import { AddPuzzlesCmd } from './@/frontend/add-puzzles-cmd'
import { AddSolutionsCmd } from './@/frontend/add-solutions-cmd'
import type { FlowFrontendCtx } from './@/frontend/ctx'
import { IPackDb, PackDb } from './@/pack/pack-db'
import { PackLoaderTypes } from './@/pack/pack-loader'
import { PackLoaderFrontend } from './@/pack/pack-loader/frontend'
import { IPuzzleDb, PuzzleDb } from './@/puzzle/puzzle-db'
import { PuzzleLoaderTypes } from './@/puzzle/puzzle-loader'
import { PuzzleLoaderFrontend } from './@/puzzle/puzzle-loader/frontend'
import { HintCalculatorTypes } from './@/solutions/hint-calculator'
import { HintCalculatorFrontend } from './@/solutions/hint-calculator/frontend'
import { Solutions } from './@/solutions/solutions'
import { SolutionsDb } from './@/solutions/solutions-db/impl'
import { ISolutionsDb } from './@/solutions/solutions-db/interface'
import { SolutionsLoaderTypes } from './@/solutions/solutions-loader'
import { SolutionsLoaderFrontend } from './@/solutions/solutions-loader/frontend'
import { ScreenBuildFrontend } from './screen-build/frontend'
import { ScreenPlayFrontend } from './screen-play/frontend'
import type { FrontendModule } from './types'

const init: FrontendModule['init'] = {
  screenBuild: ScreenBuildFrontend.init,
  screenPlay: ScreenPlayFrontend.init,
  puzzleLoader: PuzzleLoaderTypes.initFrontend,
  packLoader: PackLoaderTypes.initFrontend,
  hintCalculator: HintCalculatorTypes.initFrontend,
  solutionsLoader: SolutionsLoaderTypes.initFrontend,
  solutions: Solutions.init,
  puzzles: {},
  packs: {},
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
    HintCalculator: input.model.hintCalculator,
    solutionsLoader: input.model.solutionsLoader,
  }
}

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateScreenPlay({ ...input, model }),
    (model) => updateScreenBuild({ ...input, model }),
    (model) => updatePackLoader({ ...input, model }),
    (model) => updatePuzzleLoader({ ...input, model }),
    (model) => updateHintCalculator({ ...input, model }),
    (model) => updateSolutionsLoader({ ...input, model }),
  )
}

const updatePuzzleLoader: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PuzzleLoaderFrontend.update({
    ctx,
    model: input.model.puzzleLoader,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, puzzleLoader: updated.model },
    eff: Eff.tag('got-puzzle-loader-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updatePackLoader: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = PackLoaderFrontend.update({
    ctx,
    model: input.model.packLoader,
    msg: input.msg?.t === 'got-pack-loader-msg' ? input.msg.c : null,
    msgBackend: input.msgBackend?.t === 'got-pack-loader-msg' ? input.msgBackend.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, packLoader: updated.model },
    eff: Eff.tag('got-pack-loader-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateHintCalculator: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = HintCalculatorFrontend.update({
    ctx,
    model: input.model.hintCalculator,
    msg: input.msg?.t === 'got-hint-calculator-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, hintCalculator: updated.model },
    eff: Eff.tag('got-hint-calculator-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateSolutionsLoader: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = SolutionsLoaderFrontend.update({
    ctx,
    model: input.model.solutionsLoader,
    msg: input.msg?.t === 'got-solutions-loader-msg' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  return {
    model: { ...input.model, solutionsLoader: updated.model },
    eff: Eff.tag('got-solutions-loader-msg', updated.eff),
    msgOut: updated.msgOut,
  }
}

const updateScreenPlay: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = ScreenPlayFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenPlay,
    model: input.model.screenPlay,
    msgIn: input.msgIn,
    msgBackend: input.msgBackend?.t === 'got-screen-play-msg' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-screen-play-msg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-screen-play-msg' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenPlay: updated.model },
    eff: Eff.tag('got-screen-play-msg', updated.eff),
    msgOut: updated.msgOut,
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-screen-play-msg' })),
  }
}

const updateScreenBuild: FrontendModule['update'] = (input) => {
  const ctx = toFlowFrontendCtx(input)

  const updated = ScreenBuildFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenBuild,
    model: input.model.screenBuild,
    msgIn: input.msgIn,
    msgBackend: input.msgBackend?.t === 'got-screen-build-msg' ? input.msgBackend.c : null,
    msgSpace: input.msgSpace?.t === 'got-screen-build-msg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'got-screen-build-msg' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenBuild: updated.model },
    eff: Eff.tag('got-screen-build-msg', updated.eff),
    msgOut: updated.msgOut,
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'got-screen-build-msg' })),
  }
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'user-changed-mode': {
      return {
        model: {
          ...input.model,
          screenPlay: ScreenPlayFrontend.init,
          screenBuild: ScreenBuildFrontend.init,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
        msgShared: [
          {
            t: 'flow-evt.user-changed-mode',
            mode: input.msgSpace.mode,
            userId: input.msgSpace.userId,
          },
        ],
      }
    }

    default: {
      return { model: input.model }
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
      return { model: input.model }
    }
  }
}

const updateFromCmd: FrontendModule['update'] = (input) => {
  const { msgIn } = input
  if (AddPacksCmd.is(msgIn)) {
    return {
      model: { ...input.model, packs: { ...input.model.packs, ...msgIn.packs } },
    }
  }

  if (AddSolutionsCmd.is(msgIn)) {
    return {
      model: { ...input.model, solutions: Solutions.merge(msgIn.solutions, input.model.solutions) },
    }
  }

  if (AddPuzzlesCmd.is(msgIn)) {
    return {
      model: { ...input.model, puzzles: { ...input.model.puzzles, ...msgIn.puzzles } },
    }
  }

  return { model: input.model }
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
        'got-screen-build-msg',
        ScreenBuildFrontend.subscriptions({
          ctx,
          modelSpace: input.modelSpace.screenBuild,
          model: input.model.screenBuild,
        }),
      )
    }

    case 'play': {
      const ctx = toFlowFrontendCtx(input)
      return Sub.tag(
        'got-screen-play-msg',
        ScreenPlayFrontend.subscriptions({
          ctx,
          modelSpace: input.modelSpace.screenPlay,
          model: input.model.screenPlay,
        }),
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
        <ScreenBuildFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-screen-build-msg', c })}
          modelSpace={input.modelSpace.screenBuild}
          model={input.model.screenBuild}
        />
      )
    }

    case 'play': {
      const ctx = toFlowFrontendCtx(input)
      return (
        <ScreenPlayFrontend.View
          ctx={ctx}
          dispatch={(c) => input.dispatch({ t: 'got-screen-play-msg', c })}
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
              c: { t: 'user-changed-mode', mode: 'play', userId: input.ctx.currentUser.userId },
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
              c: { t: 'user-changed-mode', mode: 'build', userId: input.ctx.currentUser.userId },
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
