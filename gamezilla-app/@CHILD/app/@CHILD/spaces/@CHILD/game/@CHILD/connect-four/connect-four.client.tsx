import { GameMainMenu } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import { GameClientModule } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { FeedItem } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/feed-item"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla-app/@CHILD/app/@SHARED/client"
import { Sub } from "gamezilla-app/@SHARED/core"
import { SpaceClientCmd } from "../../../../@SHARED/space-client-cmd"
import { VsBot } from "./@CHILD/vs-bot/vs-bot.client"
import { VsUser } from "./@CHILD/vs-user/vs-user.client"
import { CoverArt } from "./@SHARED/connect-four-ui/connect-four-cover-art"
import {
  ModelClient,
  ModelSync,
  MsgClient,
  MsgSync,
  MsgToClient,
  MsgToServer,
} from "./connect-four.core"

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
  ModelSync: ModelSync
  MsgSync: MsgSync
  Ctx: SpaceClientCtx
  MsgInCmd: null
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: null
}>

//
//
//
// Model
//
//
//

const init: Module["init"] = { t: null }

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateChild(model)(input),
    (model) => updateFromMsg(model)(input),
    (model) => updateFromMsgSync(model)(input),
  )
}

const updateFromMsg =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg } = input

    switch (msg?.t) {
      case "user-changed-mode": {
        return { model, msgSync: [withId(msg)] }
      }

      default: {
        return { model }
      }
    }
  }

const updateFromMsgSync =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msgSync } = input

    if (!msgSync) {
      return { model }
    }

    switch (msgSync.t) {
      case "user-changed-mode": {
        switch (msgSync.mode) {
          case "none": {
            return {
              model: { t: null },
              msgCmd: [playSound(APP_SOUND.navBackwardMin)],
            }
          }

          case "vs-bot": {
            return {
              model: { t: "vs-bot", c: VsBot.init },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
            }
          }

          case "vs-user": {
            return {
              model: { t: "vs-user", c: VsUser.init },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
            }
          }
        }
      }

      case "vs-bot":
      case "vs-user": {
        return { model }
      }
    }
  }

const updateChild =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg, msgEvt, msgSync, msgServer, modelSync } = input

    switch (modelSync.t) {
      case "none": {
        return { model }
      }

      case "vs-bot": {
        const updated = VsBot.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          msg: msg?.t === "vs-bot" ? msg.c : null,
          msgEvt: msgEvt,
          msgCmd: null,
          msgSync:
            msgSync?.t === "vs-bot" ? { ...msgSync, ...msgSync.c } : null,
          msgServer: msgServer?.t === "vs-bot" ? msgServer.c : null,
          model: model.t === "vs-bot" ? model.c : VsBot.init,
          modelSync: modelSync.c,
        })

        return GameClientModule.tagOutput(
          "vs-bot",
          (msgCmd) => ClientCmd.tag("vs-bot", msgCmd),
          updated,
        )
      }

      case "vs-user": {
        const updated = VsUser.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          model: model.t === "vs-user" ? model.c : VsUser.init,
          msg: msg?.t === "vs-user" ? msg.c : null,
          msgCmd: null,
          msgEvt: msgEvt,
          msgSync:
            msgSync?.t === "vs-user" ? { ...msgSync, ...msgSync.c } : null,
          msgServer: msgServer?.t === "vs-user" ? msgServer.c : null,
          modelSync: modelSync.c,
        })

        return GameClientModule.tagOutput(
          "vs-user",
          (msgCmd) => ClientCmd.tag("vs-user", msgCmd),
          updated,
        )
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

const View: Module["View"] = ({ dispatch, ctx, modelSync, model }) => {
  const onQuit = () => {
    dispatch({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    })
  }

  switch (modelSync.t) {
    case "none": {
      return (
        <GameMainMenu.View
          ctx={ctx}
          title="Connect Four"
          renderCoverArt={(props) => <CoverArt {...props} />}
          dispatch={dispatch}
          buttons={[
            GameMainMenu.buttons.playFriend({
              onClick: () =>
                dispatch({
                  mode: "vs-user",
                  t: "user-changed-mode",
                  userId: ctx.currentUserId,
                }),
            }),
            GameMainMenu.buttons.playComputer({
              onClick: () =>
                dispatch({
                  mode: "vs-bot",
                  t: "user-changed-mode",
                  userId: ctx.currentUserId,
                }),
            }),
          ]}
        />
      )
    }

    case "vs-bot": {
      return (
        <VsBot.View
          ctx={{ ...ctx, onQuit }}
          dispatch={(c) => dispatch({ t: "vs-bot", c })}
          model={model?.t === "vs-bot" ? model.c : VsBot.init}
          modelSync={modelSync.c}
        />
      )
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          dispatch={(c) => dispatch({ t: "vs-user", c })}
          model={model?.t === "vs-user" ? model.c : VsUser.init}
          modelSync={modelSync.c}
        />
      )
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { modelSync, ctx, msgSync } = input
  switch (msgSync.t) {
    case "user-changed-mode": {
      switch (msgSync.mode) {
        case "none": {
          const profile = ctx.profiles[ctx.currentUserId]

          if (!profile) {
            return <FeedItem.Info text={`Exited game to main menu`} />
          }

          return (
            <FeedItem.Info
              text={`${profile.username} exited game to main menu`}
            />
          )
        }

        default: {
          const profile = ctx.profiles[ctx.currentUserId]

          if (!profile) {
            return <FeedItem.Info text={`Changed game mode`} />
          }

          return (
            <FeedItem.Info text={`${profile.username} changed game mode`} />
          )
        }
      }
    }

    case "vs-bot": {
      switch (modelSync.t) {
        case "vs-bot": {
          return (
            <VsBot.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgSync={msgSync.c}
              modelSync={modelSync.c}
              dispatch={(c) => input.dispatch({ t: "vs-bot", c })}
            />
          )
        }
        default: {
          return null
        }
      }
    }

    case "vs-user": {
      switch (modelSync.t) {
        case "vs-user": {
          return (
            <VsUser.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgSync={msgSync.c}
              modelSync={modelSync.c}
              dispatch={(c) => input.dispatch({ t: "vs-user", c })}
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

const subscriptions: Module["subscriptions"] = async (input) => {
  const { model, modelSync } = input

  switch (modelSync.t) {
    case "none": {
      return Sub.None
    }

    case "vs-bot": {
      return Sub.tag(
        "vs-bot",
        await VsBot.subscriptions({
          ...input,
          model: model?.t === "vs-bot" ? model.c : VsBot.init,
          modelSync: modelSync.c,
          ctx: { ...input.ctx, onQuit: () => {} },
        }),
      )
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        await VsUser.subscriptions({
          ...input,
          model: model?.t === "vs-user" ? model.c : VsUser.init,
          modelSync: modelSync.c,
          ctx: { ...input.ctx, onQuit: () => {} },
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
