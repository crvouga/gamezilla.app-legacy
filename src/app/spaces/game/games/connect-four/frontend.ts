import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { v } from '~/@/vdom/v'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { FeedItem } from '~/app/spaces/@/feed-item'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/connect-four-ui/connect-four-cover-art'
import type { ModelFrontend, ModelSpace, MsgFrontend, MsgSpace, MsgToBackend, MsgToFrontend } from './types'
import { VsBot } from './vs-bot/vs-bot.frontend'
import { VsUser } from './vs-user/vs-user.frontend'

//
//
//
//
//
//
//

type Module = GameFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ModelSpace: ModelSpace
  MsgSpace: MsgSpace
  Ctx: SpaceFrontendCtx
}>

//
//
//
// Model
//
//
//

const init: Module['init'] = { t: null }

//
//
//
// Update
//
//
//

const update: Module['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateChild(model)(input),
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgSpace(model)(input),
  )
}

const updateFromMsg =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msg } = input

    switch (msg?.t) {
      case 'user-changed-mode': {
        return {
          model,
          msgSpace: [withEventId(msg)],
        }
      }

      default: {
        return {
          model,
        }
      }
    }
  }

const updateFromMsgSpace =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msgSpace } = input

    if (!msgSpace) {
      return {
        model,
      }
    }

    switch (msgSpace.t) {
      case 'user-changed-mode': {
        switch (msgSpace.mode) {
          case 'none': {
            return {
              model: {
                t: null,
              },
              msgOut: [PlaySoundCmd.init(APP_SOUND.navBackwardMin)],
            }
          }

          case 'vs-bot': {
            return {
              model: {
                t: 'vs-bot',
                c: VsBot.init,
              },
              msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
            }
          }

          case 'vs-user': {
            return {
              model: {
                t: 'vs-user',
                c: VsUser.init,
              },
              msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)],
            }
          }
        }
      }

      case 'vs-bot':
      case 'vs-user': {
        return {
          model,
        }
      }
    }
  }

const updateChild =
  (model: ModelFrontend): Module['update'] =>
  (input) => {
    const { msgIn, msg, msgSpace, modelSpace } = input

    switch (modelSpace.t) {
      case 'none': {
        return {
          model,
        }
      }

      case 'vs-bot': {
        const updated = VsBot.update({
          ctx: input.ctx,
          msg: msg?.t === 'vs-bot' ? msg.c : null,
          msgIn,
          msgSpace: msgSpace?.t === 'vs-bot' ? { ...msgSpace, ...msgSpace.c } : null,
          model: model.t === 'vs-bot' ? model.c : VsBot.init,
          modelSpace: modelSpace.c,
        })

        return {
          model: { t: 'vs-bot', c: updated.model },
          eff: Eff.tag('vs-bot', updated.eff),
          msgSpace: updated.msgSpace?.map((c) => ({ c, t: 'vs-bot' })),
          msgOut: updated.msgOut,
        }
      }

      case 'vs-user': {
        const updated = VsUser.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          model: model.t === 'vs-user' ? model.c : VsUser.init,
          msg: msg?.t === 'vs-user' ? msg.c : null,
          msgIn,
          msgSpace: msgSpace?.t === 'vs-user' ? { ...msgSpace, ...msgSpace.c } : null,
          modelSpace: modelSpace.c,
        })

        return {
          model: { t: 'vs-user', c: updated.model },
          eff: Eff.tag('vs-user', updated.eff),
          msgSpace: updated.msgSpace?.map((c) => ({ c, t: 'vs-user' })),
        }
      }
    }
  }

//
//
//
// View
//
//
//

const View: Module['View'] = (input) => {
  const onQuit = () => {
    input.dispatch({
      t: 'user-changed-mode',
      mode: 'none',
      userId: input.ctx.currentUser.userId,
    })
  }

  switch (input.modelSpace.t) {
    case 'none': {
      return v(GameMainMenu.View, {
        ctx: input.ctx,
        title: input.ctx.t('connect-four'),
        renderCoverArt: (input) => v(CoverArt, input),
        onBack: () => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' }),
        dispatch: input.dispatch,
        buttons: [
          GameMainMenu.buttons.playFriend({
            ctx: input.ctx,
            onClick: () =>
              input.dispatch({
                mode: 'vs-user',
                t: 'user-changed-mode',
                userId: input.ctx.currentUser.userId,
              }),
          }),
          GameMainMenu.buttons.playComputer({
            ctx: input.ctx,
            onClick: () =>
              input.dispatch({
                mode: 'vs-bot',
                t: 'user-changed-mode',
                userId: input.ctx.currentUser.userId,
              }),
          }),
        ],
      })
    }

    case 'vs-bot': {
      return v(VsBot.View, {
        ctx: input.ctx,
        dispatch: (c) =>
          input.dispatch({
            t: 'vs-bot',
            c,
          }),
        model: input.model?.t === 'vs-bot' ? input.model.c : VsBot.init,
        modelSpace: input.modelSpace.c,
      })
    }

    case 'vs-user': {
      return v(VsUser.View, {
        ctx: {
          ...input.ctx,
          onQuit,
        },
        dispatch: (c) =>
          input.dispatch({
            t: 'vs-user',
            c,
          }),
        model: input.model?.t === 'vs-user' ? input.model.c : VsUser.init,
        modelSpace: input.modelSpace.c,
      })
    }
  }
}

const ViewFeedItem: Module['ViewFeedItem'] = (input) => {
  const { modelSpace, ctx, msgSpace } = input
  switch (msgSpace.t) {
    case 'user-changed-mode': {
      switch (msgSpace.mode) {
        case 'none': {
          const profile = ctx.profilesByUserId[ctx.currentUser.userId]

          if (!profile) {
            return v(FeedItem.Info, { text: 'Exited game to main menu' })
          }

          return v(FeedItem.Info, { text: `${profile.username} exited game to main menu` })
        }

        default: {
          const profile = ctx.profilesByUserId[ctx.currentUser.userId]

          if (!profile) {
            return v(FeedItem.Info, { text: 'Changed game mode' })
          }

          return v(FeedItem.Info, { text: `${profile.username} changed game mode` })
        }
      }
    }

    case 'vs-bot': {
      switch (modelSpace.t) {
        case 'vs-bot': {
          return v(VsBot.ViewFeedItem, {
            ctx: ctx,
            msgSpace: msgSpace.c,
            modelSpace: modelSpace.c,
            dispatch: (c) =>
              input.dispatch({
                t: 'vs-bot',
                c,
              }),
          })
        }
        default: {
          return null
        }
      }
    }

    case 'vs-user': {
      switch (modelSpace.t) {
        case 'vs-user': {
          return v(VsUser.ViewFeedItem, {
            ctx: {
              ...ctx,
              onQuit: () => {},
            },
            msgSpace: msgSpace.c,
            modelSpace: modelSpace.c,
            dispatch: (c) =>
              input.dispatch({
                t: 'vs-user',
                c,
              }),
          })
        }
        default: {
          return null
        }
      }
    }
  }
}

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module['subscriptions'] = (input) => {
  const { model, modelSpace } = input

  switch (modelSpace.t) {
    case 'none': {
      return Sub.none()
    }

    case 'vs-bot': {
      return Sub.map(
        VsBot.subscriptions({
          ...input,
          model: model?.t === 'vs-bot' ? model.c : VsBot.init,
          modelSpace: modelSpace.c,
          ctx: input.ctx,
        }),
        (c): MsgFrontend => ({ t: 'vs-bot', c }),
      )
    }

    case 'vs-user': {
      return Sub.map(
        VsUser.subscriptions({
          ...input,
          model: model?.t === 'vs-user' ? model.c : VsUser.init,
          modelSpace: modelSpace.c,
          ctx: {
            ...input.ctx,
            onQuit: () => {},
          },
        }),
        (c): MsgFrontend => ({ t: 'vs-user', c }),
      )
    }
  }
}

export const ConnectFour: Module = {
  init,
  update,
  View,
  ViewFeedItem,
  subscriptions,
}
