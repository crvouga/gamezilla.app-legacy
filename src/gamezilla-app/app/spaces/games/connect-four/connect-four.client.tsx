import { Eff, Sub } from '@/core'
import { APP_SOUND, AppClientCmd, playSound } from 'gamezilla-app/app/@/client'
import { withEventId } from '@/event-sourced/event'
import { FeedItem } from 'gamezilla-app/app/spaces/@/feed-item'
import { GameClientModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-client-v2'
import type { SpaceClientCmd } from '../../@/space-client-cmd'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import { SpaceClientEvt } from '../../@/space-client-evt'
import { GameMainMenu } from '../@/game/game-main-menu'
import { CoverArt } from './@/connect-four-ui/connect-four-cover-art'
import type { ModelClient, ModelCore, MsgClient, MsgCore, MsgToClient, MsgToServer } from './connect-four.types'
import { VsBot } from './vs-bot/vs-bot.client'
import { VsUser } from './vs-user/vs-user.client'

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelCore: ModelCore
  MsgCore: MsgCore
  Ctx: SpaceClientCtx
  MsgEvtIn: SpaceClientEvt
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
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
  return GameClientModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateChild(model)(input),
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgCore(model)(input)
  )
}

const updateFromMsg =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msg } = input

    switch (msg?.t) {
      case 'user-changed-mode': {
        return {
          model,
          msgCore: [withEventId(msg)]
        }
      }

      default: {
        return {
          model
        }
      }
    }
  }

const updateFromMsgCore =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msgCore } = input

    if (!msgCore) {
      return {
        model
      }
    }

    switch (msgCore.t) {
      case 'user-changed-mode': {
        switch (msgCore.mode) {
          case 'none': {
            return {
              model: {
                t: null
              },
              msgCmd: [playSound(APP_SOUND.navBackwardMin)]
            }
          }

          case 'vs-bot': {
            return {
              model: {
                t: 'vs-bot',
                c: VsBot.init
              },
              msgCmd: [playSound(APP_SOUND.navForwardMin)]
            }
          }

          case 'vs-user': {
            return {
              model: {
                t: 'vs-user',
                c: VsUser.init
              },
              msgCmd: [playSound(APP_SOUND.navForwardMin)]
            }
          }
        }
      }

      case 'vs-bot':
      case 'vs-user': {
        return {
          model
        }
      }
    }
  }

const updateChild =
  (model: ModelClient): Module['update'] =>
  (input) => {
    const { msg, msgEvt, msgCore, msgServer, modelCore } = input

    switch (modelCore.t) {
      case 'none': {
        return {
          model
        }
      }

      case 'vs-bot': {
        const updated = VsBot.update({
          ctx: input.ctx,
          msg: msg?.t === 'vs-bot' ? msg.c : null,
          msgEvt: msgEvt,
          msgCmd: null,
          msgCore: msgCore?.t === 'vs-bot' ? { ...msgCore, ...msgCore.c } : null,
          msgServer: msgServer?.t === 'vs-bot' ? msgServer.c : null,
          model: model.t === 'vs-bot' ? model.c : VsBot.init,
          modelCore: modelCore.c
        })

        return {
          model: { t: 'vs-bot', c: updated.model },
          eff: Eff.tag('vs-bot', updated.eff),
          msgCmd: AppClientCmd.tag('vs-bot', updated.msgCmd),
          msgCore: updated.msgCore?.map((c) => ({ c, t: 'vs-bot' })),
          msgEvt: updated.msgEvt
        }
      }

      case 'vs-user': {
        const updated = VsUser.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          model: model.t === 'vs-user' ? model.c : VsUser.init,
          msg: msg?.t === 'vs-user' ? msg.c : null,
          msgCmd: null,
          msgEvt: msgEvt,
          msgCore: msgCore?.t === 'vs-user' ? { ...msgCore, ...msgCore.c } : null,
          msgServer: msgServer?.t === 'vs-user' ? msgServer.c : null,
          modelCore: modelCore.c
        })

        return {
          model: { t: 'vs-user', c: updated.model },
          eff: Eff.tag('vs-user', updated.eff),
          msgCmd: AppClientCmd.tag('vs-user', updated.msgCmd),
          msgCore: updated.msgCore?.map((c) => ({ c, t: 'vs-user' })),
          msgEvt: updated.msgEvt
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
      userId: input.ctx.currentUserId
    })
  }

  switch (input.modelCore.t) {
    case 'none': {
      return (
        <GameMainMenu.View
          ctx={input.ctx}
          title={input.ctx.t('connect-four')}
          renderCoverArt={(input) => <CoverArt {...input} key={input.key} />}
          onBack={() => input.dispatch({ t: 'game-main-menu/clicked-exit-game-button' })}
          dispatch={input.dispatch}
          buttons={[
            GameMainMenu.buttons.playFriend({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  mode: 'vs-user',
                  t: 'user-changed-mode',
                  userId: input.ctx.currentUserId
                })
            }),
            GameMainMenu.buttons.playComputer({
              ctx: input.ctx,
              onClick: () =>
                input.dispatch({
                  mode: 'vs-bot',
                  t: 'user-changed-mode',
                  userId: input.ctx.currentUserId
                })
            })
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
              c
            })
          }
          model={input.model?.t === 'vs-bot' ? input.model.c : VsBot.init}
          modelCore={input.modelCore.c}
        />
      )
    }

    case 'vs-user': {
      return (
        <VsUser.View
          ctx={{
            ...input.ctx,
            onQuit
          }}
          dispatch={(c) =>
            input.dispatch({
              t: 'vs-user',
              c
            })
          }
          model={input.model?.t === 'vs-user' ? input.model.c : VsUser.init}
          modelCore={input.modelCore.c}
        />
      )
    }
  }
}

const ViewFeedItem: Module['ViewFeedItem'] = (input) => {
  const { modelCore, ctx, msgCore } = input
  switch (msgCore.t) {
    case 'user-changed-mode': {
      switch (msgCore.mode) {
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
      switch (modelCore.t) {
        case 'vs-bot': {
          return (
            <VsBot.ViewFeedItem
              ctx={ctx}
              msgCore={msgCore.c}
              modelCore={modelCore.c}
              dispatch={(c) =>
                input.dispatch({
                  t: 'vs-bot',
                  c
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
      switch (modelCore.t) {
        case 'vs-user': {
          return (
            <VsUser.ViewFeedItem
              ctx={{
                ...ctx,
                onQuit: () => {}
              }}
              msgCore={msgCore.c}
              modelCore={modelCore.c}
              dispatch={(c) =>
                input.dispatch({
                  t: 'vs-user',
                  c
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
  const { model, modelCore } = input

  switch (modelCore.t) {
    case 'none': {
      return Sub.None
    }

    case 'vs-bot': {
      return Sub.tag(
        'vs-bot',
        VsBot.subscriptions({
          ...input,
          model: model?.t === 'vs-bot' ? model.c : VsBot.init,
          modelCore: modelCore.c,
          ctx: input.ctx
        })
      )
    }

    case 'vs-user': {
      return Sub.tag(
        'vs-user',
        VsUser.subscriptions({
          ...input,
          model: model?.t === 'vs-user' ? model.c : VsUser.init,
          modelCore: modelCore.c,
          ctx: {
            ...input.ctx,
            onQuit: () => {}
          }
        })
      )
    }
  }
}

export const ConnectFour: Module = {
  init,
  update,
  View,
  ViewFeedItem,
  subscriptions
}
