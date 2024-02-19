import { GameMainMenu } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client"
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { Sub } from "gamezilla/@SHARED/core"
import { SpaceClientCmd } from "../../../../@SHARED/space-client-cmd"
import { BuilderClient } from "./@CHILD/builder/builder.client"
import { PlayClient } from "./@CHILD/play/play.client"
import { CoverArt } from "./@SHARED/flow-cover-art"
import { FlowClientCtx } from "./@SHARED/flow-ctx"
import {
  ModelClient,
  ModelSync,
  MsgClient,
  MsgSync,
  MsgToClient,
  MsgToServer,
} from "./flow.core"

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
  //
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  //
  MsgSync: MsgSync
  ModelSync: ModelSync
  //
  Ctx: SpaceClientCtx
  //
  MsgOutCmd: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgInEvent: SpaceClientEvent
  MsgInCmd: null
  MsgOutEvent: null
}>

//
//
//
//
//
//

const init: Module["init"] = {
  t: "none",
  puzzles: {},
}

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSync({ ...input, model }),
    (model) => updateChild({ ...input, model }),
  )
}

const updateChild: Module["update"] = async (input) => {
  const { model, modelSync, msgEvt, ctx, msgCmd, msgSync, msgServer, msg } =
    input

  switch (modelSync.t) {
    case null: {
      return { model }
    }

    case "play": {
      const updated = await PlayClient.update({
        ctx: { ...ctx, onQuit: () => {} },
        modelSync: modelSync.c,
        model: model.t === "play" ? model.c : PlayClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "play" ? msgServer.c : null,
        msgSync: msgSync?.t === "play" ? { ...msgSync, ...msgSync.c } : null,
        msg: msg?.t === "play" ? msg.c : null,
      })

      const tagged = await GameClientModule.tagOutput(
        "play",
        (msgCmd) => ClientCmd.tag("play", msgCmd),
        updated,
      )

      return {
        ...tagged,
        model: { ...tagged.model, puzzles: model.puzzles },
      }
    }

    case "builder": {
      const updated = await BuilderClient.update({
        ctx: { ...ctx, onQuit: () => {} },
        modelSync: modelSync.c,
        model: model.t === "builder" ? model.c : BuilderClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "builder" ? msgServer.c : null,
        msgSync: msgSync?.t === "builder" ? { ...msgSync, ...msgSync.c } : null,
        msg: msg?.t === "builder" ? msg.c : null,
      })

      const tagged = await GameClientModule.tagOutput(
        "builder",
        (msgCmd) => SpaceClientCmd.tag("builder", msgCmd),
        updated,
      )

      return {
        ...tagged,
        model: { ...tagged.model, puzzles: model.puzzles },
      }
    }
  }
}

const updateFromMsgSync: Module["update"] = (input) => {
  const { msgSync, model } = input

  switch (msgSync?.t) {
    case "user-changed-mode": {
      switch (msgSync.mode) {
        case "play": {
          return {
            model: { ...model, t: "play", c: PlayClient.init },
            msgCmd: [playSound(APP_SOUND.navForwardMin)],
          }
        }

        case "builder": {
          return {
            model: {
              ...model,
              t: "builder",
              c: BuilderClient.init,
            },
            msgCmd: [playSound(APP_SOUND.navForwardMin)],
          }
        }

        case null: {
          return {
            model: { ...model, t: "none" },
            msgCmd: [playSound(APP_SOUND.navBackwardMin)],
          }
        }
      }
    }

    default: {
      return { model }
    }
  }
}

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model } = input

  switch (msg?.t) {
    case "msgSync": {
      const msgSync = withId(msg.c)
      return {
        model,
        msgSync: [msgSync],
      }
    }

    default: {
      return { model }
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

const subscriptions: Module["subscriptions"] = async (input) => {
  switch (input.modelSync.t) {
    case "play": {
      return Sub.tag(
        "play",
        await PlayClient.subscriptions({
          ctx: {
            ...input.ctx,
            onQuit() {},
          },
          modelSync: input.modelSync.c,
          model: input.model.t === "play" ? input.model.c : PlayClient.init,
        }),
      )
    }
    case "builder": {
      return Sub.tag(
        "builder",
        await BuilderClient.subscriptions({
          ctx: {
            ...input.ctx,
            onQuit() {},
          },
          modelSync: input.modelSync.c,
          model:
            input.model.t === "builder" ? input.model.c : BuilderClient.init,
        }),
      )
    }

    default: {
      return Sub.None
    }
  }
}

//
//
// View
//
//

const View: Module["View"] = (input) => {
  const { modelSync, dispatch } = input

  const ctx: FlowClientCtx = {
    ...input.ctx,
    onQuit: () =>
      dispatch({
        t: "msgSync",
        c: {
          t: "user-changed-mode",
          mode: null,
          userId: input.ctx.currentUserId,
        },
      }),
  }

  switch (modelSync.t) {
    case null: {
      return (
        <GameMainMenu.View
          renderCoverArt={(props) => <CoverArt {...props} />}
          ctx={ctx}
          title="Flow"
          dispatch={dispatch}
          buttons={[
            {
              renderIcon: (props) => <IconGamepad {...props} />,
              title: "Play",
              description: "Start playing puzzles",
              onClick: () => {
                dispatch({
                  t: "msgSync",
                  c: {
                    t: "user-changed-mode",
                    mode: "play",
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
            {
              renderIcon: (props) => <IconScrewdriverWrench {...props} />,
              title: "Puzzle builder",
              description: "Build new puzzles to play",
              onClick: () => {
                dispatch({
                  t: "msgSync",
                  c: {
                    t: "user-changed-mode",
                    mode: "builder",
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
          ]}
        />
      )
    }

    case "builder": {
      return (
        <BuilderClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "builder", c })}
          modelSync={modelSync.c}
          model={
            input.model.t === "builder" ? input.model.c : BuilderClient.init
          }
        />
      )
    }

    case "play": {
      return (
        <PlayClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "play", c })}
          modelSync={modelSync.c}
          model={input.model.t === "play" ? input.model.c : PlayClient.init}
        />
      )
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = ({
  ctx,
  dispatch,
  modelSync,
  msgSync,
}) => {
  switch (msgSync.t) {
    case "play": {
      switch (modelSync.t) {
        case "play": {
          return (
            <PlayClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {} }}
              dispatch={(c) => dispatch({ t: "play", c })}
              modelSync={modelSync.c}
              msgSync={msgSync.c}
            />
          )
        }
        default: {
          return null
        }
      }
    }

    case "builder": {
      switch (modelSync.t) {
        case "builder": {
          return (
            <BuilderClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {} }}
              dispatch={(c) => dispatch({ t: "builder", c })}
              modelSync={modelSync.c}
              msgSync={msgSync.c}
            />
          )
        }

        default: {
          return null
        }
      }
    }

    default: {
      return null
    }
  }
}

export const FlowClient: Module = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
