import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { IconGamepad, IconScrewdriverWrench } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/cover-art'
import type { FlowFrontendCtx } from './@/frontend/ctx'
import { IPackDb, PackDb } from './@/pack/pack-db'
import { IPuzzleDb, PuzzleDb } from './@/puzzle/puzzle-db'
import { HintCalculatorTypes } from './@/solutions/hint-calculator'
import { HintCalculatorFrontend } from './@/solutions/hint-calculator/frontend'
import { SolutionsDb } from './@/solutions/solutions-db/impl'
import { ISolutionsDb } from './@/solutions/solutions-db/interface'
import { ScreenBuildFrontend } from './screen-build/frontend'
import { ScreenPlayFrontend } from './screen-play/frontend'
import { type FrontendModule, type MsgFrontend } from './types'

const init: FrontendModule['init'] = {
  screenBuild: ScreenBuildFrontend.init,
  screenPlay: ScreenPlayFrontend.init,
  hintCalculator: HintCalculatorTypes.initFrontend,
}

let puzzleDb: IPuzzleDb
let packDb: IPackDb
let solutionsDb: ISolutionsDb
const toFrontendCtx = (input: Parameters<FrontendModule['update']>[0]): FlowFrontendCtx => {
  puzzleDb ??= PuzzleDb.init({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })
  packDb ??= PackDb.init({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })
  solutionsDb ??= SolutionsDb.init({
    t: 'sql-db',
    sqlDb: input.ctx.sqlDb,
    migrationPolicy: input.ctx.migrationPolicy,
    logger: input.ctx.logger,
  })
  return {
    ...input.ctx,
    puzzleDb,
    packDb,
    solutionsDb,
    hintCalculator: input.model.hintCalculator,
  }
}

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSpace({ ...input, model }),
    (model) => updateScreenPlay({ ...input, model }),
    (model) => updateScreenBuild({ ...input, model }),
    (model) => updateHintCalculator({ ...input, model }),
  )
}

const updateHintCalculator: FrontendModule['update'] = (input) => {
  const ctx = toFrontendCtx(input)

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

const updateScreenPlay: FrontendModule['update'] = (input) => {
  const ctx = toFrontendCtx(input)
  const updated = ScreenPlayFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenPlay,
    msgSpace: input.msgSpace?.t === 'gotScreenPlayMsg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
  })
  return {
    eff: Eff.tag('gotScreenPlayMsg', updated.eff),
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'gotScreenPlayMsg' })),
  }
}

const updateScreenBuild: FrontendModule['update'] = (input) => {
  const ctx = toFrontendCtx(input)

  const updated = ScreenBuildFrontend.update({
    ctx,
    modelSpace: input.modelSpace.screenBuild,
    model: input.model.screenBuild,
    msgIn: input.msgIn,
    msgSpace: input.msgSpace?.t === 'gotScreenBuildMsg' ? { ...input.msgSpace, ...input.msgSpace.c } : null,
    msg: input.msg?.t === 'gotScreenBuildMsg' ? input.msg.c : null,
  })

  return {
    model: { ...input.model, screenBuild: updated.model },
    eff: Eff.tag('gotScreenBuildMsg', updated.eff),
    msgOut: updated.msgOut,
    msgSpace: updated.msgSpace?.map((c) => ({ ...c, c, t: 'gotScreenBuildMsg' })),
  }
}

const updateFromMsgSpace: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'numberlink_userChangedMode': {
      return {
        model: {
          ...input.model,
          screenPlay: ScreenPlayFrontend.init,
          screenBuild: ScreenBuildFrontend.init,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
        msgShared: [
          {
            t: 'numberlink-evt.user-changed-mode',
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
      return { model: input.model, msgSpace: [input.msg.c] }
    }

    default: {
      return { model: input.model }
    }
  }
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  switch (input.modelSpace.mode) {
    case 'build': {
      const ctx = toFrontendCtx(input)
      return Sub.map(
        ScreenBuildFrontend.subscriptions({
          ctx,
          modelSpace: input.modelSpace.screenBuild,
          model: input.model.screenBuild,
        }),
        (c): MsgFrontend => ({ t: 'gotScreenBuildMsg', c }),
      )
    }

    case 'play': {
      const ctx = toFrontendCtx(input)
      return Sub.map(
        ScreenPlayFrontend.subscriptions({
          ctx,
          modelSpace: input.modelSpace.screenPlay,
          model: input.model.screenPlay,
        }),
        (c): MsgFrontend => ({ t: 'gotScreenPlayMsg', c }),
      )
    }

    case 'none': {
      return Sub.none()
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
      return h(ViewMainMenu, input)
    }

    case 'build': {
      const ctx = toFrontendCtx(input)

      return h(ScreenBuildFrontend.View, {
        ctx,
        dispatch: (c) => input.dispatch({ t: 'gotScreenBuildMsg', c }),
        modelSpace: input.modelSpace.screenBuild,
        model: input.model.screenBuild,
      })
    }

    case 'play': {
      const ctx = toFrontendCtx(input)
      return h(ScreenPlayFrontend.View, {
        ctx,
        dispatch: (c) => input.dispatch({ t: 'gotScreenPlayMsg', c }),
        modelSpace: input.modelSpace.screenPlay,
        model: input.model.screenPlay,
      })
    }
  }
}

export const TEST_ID_NUMBERLINK_MAIN_MENU_SCREEN = 'numberlink-main-menu-screen'

const ViewMainMenu: FrontendModule['View'] = (input) => {
  const ctx = toFrontendCtx(input)

  return h(GameMainMenu.View, {
    dataTestId: TEST_ID_NUMBERLINK_MAIN_MENU_SCREEN,
    renderCoverArt: (input) => h(CoverArt, { ...input, platform: ctx.platform }),
    ctx,
    title: ctx.t('numberlink'),
    dispatch: input.dispatch,
    onBack: () => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' }),
    buttons: [
      {
        renderIcon: (input) => h(IconGamepad, input),
        title: ctx.t('game.numberlink.play'),
        description: ctx.t('game.numberlink.play-description'),
        onPress: () => {
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'numberlink_userChangedMode', mode: 'play', userId: input.ctx.currentUser.userId },
          })
        },
      },
      {
        renderIcon: (input) => h(IconScrewdriverWrench, input),
        title: ctx.t('game.numberlink.build'),
        description: ctx.t('game.numberlink.build-description'),
        onPress: () => {
          input.dispatch({
            t: 'got-msg-space',
            c: { t: 'numberlink_userChangedMode', mode: 'build', userId: input.ctx.currentUser.userId },
          })
        },
      },
    ],
  })
}

const ViewFeedItem: FrontendModule['ViewFeedItem'] = (_input) => {
  return null
}

export const NumberlinkFrontend = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
