import { Eff } from '~/@/eff'
import { withEventId } from '~/@/event-sourced/event'
import { Sub } from '~/@/sub'
import { APP_SOUND, AppFrontendCmd, playSound } from '~/app/@/frontend/cmd'
import { FeedItem } from '~/app/spaces/@/feed-item'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import type { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { SpaceFrontendEvt } from '~/app/spaces/@/space-frontend/evt'
import { GameMainMenu } from '../@/ui/game-main-menu'
import { CoverArt } from './@/connect-four-ui/connect-four-cover-art'
import type {
  ModelFrontend,
  ModelSpace,
  MsgFrontend,
  MsgSpace,
  MsgToFrontend,
  MsgToBackend,
} from './connect-four.types'
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
  MsgEvtIn: SpaceFrontendEvt
  MsgCmdOut: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
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
              msgCmd: [playSound(APP_SOUND.navBackwardMin)],
            }
          }

          case 'vs-bot': {
            return {
              model: {
                t: 'vs-bot',
                c: VsBot.init,
              },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
            }
          }

          case 'vs-user': {
            return {
              model: {
                t: 'vs-user',
                c: VsUser.init,
              },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
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
    const { msg, msgEvt, msgSpace, msgBackend, modelSpace } = input

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
          msgEvt: msgEvt,
          msgCmd: null,
          msgSpace: msgSpace?.t === 'vs-bot' ? { ...msgSpace, ...msgSpace.c } : null,
          msgBackend: msgBackend?.t === 'vs-bot' ? msgBackend.c : null,
          model: model.t === 'vs-bot' ? model.c : VsBot.init,
          modelSpace: modelSpace.c,
        })

        return {
          model: { t: 'vs-bot', c: updated.model },
          eff: Eff.tag('vs-bot', updated.eff),
          msgCmd: AppFrontendCmd.tag('vs-bot', updated.msgCmd),
          msgSpace: updated.msgSpace?.map((c) => ({ c, t: 'vs-bot' })),
          msgEvt: updated.msgEvt,
        }
      }

      case 'vs-user': {
        const updated = VsUser.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          model: model.t === 'vs-user' ? model.c : VsUser.init,
          msg: msg?.t === 'vs-user' ? msg.c : null,
          msgCmd: null,
          msgEvt: msgEvt,
          msgSpace: msgSpace?.t === 'vs-user' ? { ...msgSpace, ...msgSpace.c } : null,
          msgBackend: msgBackend?.t === 'vs-user' ? msgBackend.c : null,
          modelSpace: modelSpace.c,
        })

        return {
          model: { t: 'vs-user', c: updated.model },
          eff: Eff.tag('vs-user', updated.eff),
          msgCmd: AppFrontendCmd.tag('vs-user', updated.msgCmd),
          msgSpace: updated.msgSpace?.map((c) => ({ c, t: 'vs-user' })),
          msgEvt: updated.msgEvt,
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
      userId: input.ctx.currentUserId,
    })
  }

  switch (input.modelSpace.t) {
    case 'none': {
      return (
        <GameMainMenu.View
          ctx={input.ctx}
          title={input.ctx.t('connect-four')}
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          onBack={() => input.dispatch({ t: 'game-main-menu.clicked-exit-game-button' })}
          dispatch={input.dispatch}
          buttons={[
            GameMainMenu.buttons.playFriend({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  mode: 'vs-user',
                  t: 'user-changed-mode',
                  userId: input.ctx.currentUserId,
                }),
            }),
            GameMainMenu.buttons.playComputer({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  mode: 'vs-bot',
                  t: 'user-changed-mode',
                  userId: input.ctx.currentUserId,
                }),
            }),
          ]}
        />
      )
    }

    case 'vs-bot': {
      return (
        <VsBot.View
          ctx={input.ctx}
          dispatch={(c) =>
            input.dispatch({
              t: 'vs-bot',
              c,
            })
          }
          model={input.model?.t === 'vs-bot' ? input.model.c : VsBot.init}
          modelSpace={input.modelSpace.c}
        />
      )
    }

    case 'vs-user': {
      return (
        <VsUser.View
          ctx={{
            ...input.ctx,
            onQuit,
          }}
          dispatch={(c) =>
            input.dispatch({
              t: 'vs-user',
              c,
            })
          }
          model={input.model?.t === 'vs-user' ? input.model.c : VsUser.init}
          modelSpace={input.modelSpace.c}
        />
      )
    }
  }
}

const ViewFeedItem: Module['ViewFeedItem'] = (input) => {
  const { modelSpace, ctx, msgSpace } = input
  switch (msgSpace.t) {
    case 'user-changed-mode': {
      switch (msgSpace.mode) {
        case 'none': {
          const profile = ctx.profiles[ctx.currentUserId]

          if (!profile) {
            return <FeedItem.Info text={'Exited game to main menu'} />
          }

          return <FeedItem.Info text={`${profile.username} exited game to main menu`} />
        }

        default: {
          const profile = ctx.profiles[ctx.currentUserId]

          if (!profile) {
            return <FeedItem.Info text={'Changed game mode'} />
          }

          return <FeedItem.Info text={`${profile.username} changed game mode`} />
        }
      }
    }

    case 'vs-bot': {
      switch (modelSpace.t) {
        case 'vs-bot': {
          return (
            <VsBot.ViewFeedItem
              ctx={ctx}
              msgSpace={msgSpace.c}
              modelSpace={modelSpace.c}
              dispatch={(c) =>
                input.dispatch({
                  t: 'vs-bot',
                  c,
                })
              }
            />
          )
        }
        default: {
          return null
        }
      }
    }

    case 'vs-user': {
      switch (modelSpace.t) {
        case 'vs-user': {
          return (
            <VsUser.ViewFeedItem
              ctx={{
                ...ctx,
                onQuit: () => {},
              }}
              msgSpace={msgSpace.c}
              modelSpace={modelSpace.c}
              dispatch={(c) =>
                input.dispatch({
                  t: 'vs-user',
                  c,
                })
              }
            />
          )
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
      return Sub.None
    }

    case 'vs-bot': {
      return Sub.tag(
        'vs-bot',
        VsBot.subscriptions({
          ...input,
          model: model?.t === 'vs-bot' ? model.c : VsBot.init,
          modelSpace: modelSpace.c,
          ctx: input.ctx,
        }),
      )
    }

    case 'vs-user': {
      return Sub.tag(
        'vs-user',
        VsUser.subscriptions({
          ...input,
          model: model?.t === 'vs-user' ? model.c : VsUser.init,
          modelSpace: modelSpace.c,
          ctx: {
            ...input.ctx,
            onQuit: () => {},
          },
        }),
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
