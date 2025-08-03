import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'

import { h } from '~/@/vdom/h'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/gomoku/gomoku-ui'
import type { ModelBackend, ModelFrontend, MsgFrontend, MsgToFrontend } from './gomoku.types'
import * as VsBot from './vs-bot/vs-bot.frontend'
import * as VsUser from './vs-user/vs-user.frontend'

//
//
//
// model
//
//
//

export type Model = ModelFrontend

export const init: Model = {
  t: 'none',
}

//
//
//
// update
//
//
//

export type Msg = MsgFrontend

export const update = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceFrontendCtx
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'input-mode') {
    return { model }
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
    const updated = VsBot.update({
      ctx,
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
    }
  }

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.update({
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
      eff: Eff.tag('vs-user', updated.eff),
    }
  }

  return { model }
}

export const updateFromBackend = ({
  ctx,
  model,
  msg,
}: {
  ctx: SpaceFrontendCtx
  msg: MsgToFrontend
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'input-mode') {
    if (msg.result.t === 'err') {
      return {
        model,
      }
    }
    const merged = mergeWithBackend({
      ctx,
      frontendModel: model,
      backendModel: msg.result.value,
    })
    return { model: merged }
  }

  if (model.t === 'vs-bot' && msg.t === 'vs-bot') {
    const updated = VsBot.updateFromBackend({
      ctx,
      msg: msg.c,
      model: model.c,
    })
    return {
      model: {
        t: 'vs-bot',
        c: updated.model,
      },
      eff: Eff.tag('vs-bot', updated.eff),
    }
  }

  if (model.t === 'vs-user' && msg.t === 'vs-user') {
    const updated = VsUser.updateFromBackend({
      model: model.c,
      msg: msg.c,
    })
    return {
      model: {
        t: 'vs-user',
        c: updated.model,
      },
      eff: Eff.tag('vs-user', updated.eff),
    }
  }

  return { model }
}

export const mergeWithBackend = ({
  ctx,
  frontendModel,
  backendModel,
}: {
  ctx: AppFrontendCtx
  frontendModel: ModelFrontend
  backendModel: ModelBackend
}): ModelFrontend => {
  switch (backendModel.t) {
    case 'none': {
      return {
        t: 'none',
      }
    }

    case 'vs-bot': {
      if (frontendModel.t === 'vs-bot') {
        return {
          t: 'vs-bot',
          c: VsBot.mergeWithBackend({
            ctx,
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        }
      }
      return {
        t: 'vs-bot',
        c: VsBot.mergeWithBackend({
          ctx,
          frontendModel: VsBot.init({
            userId: null,
          }),
          backendModel: backendModel.c,
        }),
      }
    }

    case 'vs-user': {
      if (frontendModel.t === 'vs-user') {
        return {
          t: 'vs-user',
          c: VsUser.mergeWithBackend({
            frontendModel: frontendModel.c,
            backendModel: backendModel.c,
          }),
        }
      }
      return {
        t: 'vs-user',
        c: VsUser.mergeWithBackend({
          frontendModel: VsUser.init({
            white: null,
            black: null,
          }),
          backendModel: backendModel.c,
        }),
      }
    }
  }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (ctx: AppFrontendCtx, model: Model): Sub<Msg> => {
  switch (model.t) {
    case 'vs-bot': {
      return Sub.map(VsBot.subscriptions(ctx, model.c), (c): Msg => ({ t: 'vs-bot', c }))
    }

    case 'vs-user': {
      return Sub.none()
    }

    case 'none': {
      return Sub.none()
    }
  }
}

//
//
//
// view
//
//
//

export const View = ({
  model,
  ctx,
  spaceCtx,
  dispatch,
}: {
  model: Model
  ctx: AppFrontendCtx
  spaceCtx: SpaceFrontendCtx
  dispatch: (m: Msg) => void
}) => {
  switch (model.t) {
    case 'none': {
      return h(GameMainMenu.View, {
        title: ctx.t('gomoku'),
        renderCoverArt: (props) => h(CoverArt, props, []),
        ctx: spaceCtx,
        dispatch: () => {
          //
        },
        onBack: () => {},
        buttons: [
          GameMainMenu.buttons.playComputer({
            ctx,
            onPress: () =>
              dispatch({
                t: 'input-mode',
                userId: ctx.currentUser.userId,
                mode: 'vs-bot',
              }),
          }),

          GameMainMenu.buttons.playFriend({
            ctx,
            onPress: () =>
              dispatch({
                t: 'input-mode',
                userId: ctx.currentUser.userId,
                mode: 'vs-user',
              }),
          }),
        ],
      })
    }

    case 'vs-bot': {
      return h(VsBot.View, {
        model: model.c,
        ctx: ctx,
        onBack: () =>
          dispatch({
            t: 'input-mode',
            mode: 'none',
            userId: ctx.currentUser.userId,
          }),
        dispatch: (c) =>
          dispatch({
            t: 'vs-bot',
            c,
          }),
      })
    }

    case 'vs-user': {
      return h(VsUser.View, {
        model: model.c,
        ctx: ctx,
        onCancel: () =>
          dispatch({
            t: 'input-mode',
            mode: 'none',
            userId: ctx.currentUser.userId,
          }),
        dispatch: (c) =>
          dispatch({
            t: 'vs-user',
            c,
          }),
      })
    }
  }
}

export const coverArt = CoverArt
