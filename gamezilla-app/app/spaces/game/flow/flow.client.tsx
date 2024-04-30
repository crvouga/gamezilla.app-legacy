import { GameMainMenu } from "gamezilla-app/app/spaces/game/@SHARED/game"
import { GameClientModule } from "gamezilla-app/app/spaces/@SHARED/architecture/game-client-v2"
import { withId } from "gamezilla-app/app/spaces/@SHARED/event"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla-app/app/spaces/@SHARED/space"
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla-app/app/@SHARED/client"
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla-app/app/@SHARED/ui"
import { Sub } from "gamezilla-app/@SHARED/core"
import { SpaceClientCmd } from "../../@SHARED/space-client-cmd"
import { CreateClient } from "./create/create.client"
import { PlayClient } from "./play/play.client"
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
  return GameClientModule.andThen(
    { model: input.model },
    (model) => GameMainMenu.update({ ...input, model }),
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgSync({ ...input, model }),
    (model) => updateChild({ ...input, model }),
  )
}

const updateChild: Module["update"] = (input) => {
  const { model, modelSync, msgEvt, ctx, msgCmd, msgSync, msgServer, msg } =
    input

  switch (modelSync.t) {
    case null: {
      return { model }
    }

    case "play": {
      const updated = PlayClient.update({
        ctx: { ...ctx, onQuit: () => {} },
        modelSync: modelSync.c,
        model: model.t === "play" ? model.c : PlayClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "play" ? msgServer.c : null,
        msgSync: msgSync?.t === "play" ? { ...msgSync, ...msgSync.c } : null,
        msg: msg?.t === "play" ? msg.c : null,
      })

      const tagged = GameClientModule.tagOutput(
        "play",
        (msgCmd) => ClientCmd.tag("play", msgCmd),
        updated,
      )

      return {
        ...tagged,
        model: { ...tagged.model, puzzles: model.puzzles },
      }
    }

    case "create": {
      const updated = CreateClient.update({
        ctx: { ...ctx, onQuit: () => {} },
        modelSync: modelSync.c,
        model: model.t === "create" ? model.c : CreateClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "create" ? msgServer.c : null,
        msgSync: msgSync?.t === "create" ? { ...msgSync, ...msgSync.c } : null,
        msg: msg?.t === "create" ? msg.c : null,
      })

      const tagged = GameClientModule.tagOutput(
        "create",
        (msgCmd) => SpaceClientCmd.tag("create", msgCmd),
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

        case "create": {
          return {
            model: {
              ...model,
              t: "create",
              c: CreateClient.init,
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

const subscriptions: Module["subscriptions"] = (input) => {
  switch (input.modelSync.t) {
    case "play": {
      return Sub.tag(
        "play",
        PlayClient.subscriptions({
          ctx: {
            ...input.ctx,
            onQuit() {},
          },
          modelSync: input.modelSync.c,
          model: input.model.t === "play" ? input.model.c : PlayClient.init,
        }),
      )
    }
    case "create": {
      return Sub.tag(
        "create",
        CreateClient.subscriptions({
          ctx: {
            ...input.ctx,
            onQuit() {},
          },
          modelSync: input.modelSync.c,
          model: input.model.t === "create" ? input.model.c : CreateClient.init,
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
          renderCoverArt={(props) => <CoverArt {...props} key={props.key} />}
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
              title: "Create",
              description: "Create new puzzles and packs",
              onClick: () => {
                dispatch({
                  t: "msgSync",
                  c: {
                    t: "user-changed-mode",
                    mode: "create",
                    userId: input.ctx.currentUserId,
                  },
                })
              },
            },
          ]}
        />
      )
    }

    case "create": {
      return (
        <CreateClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "create", c })}
          modelSync={modelSync.c}
          model={input.model.t === "create" ? input.model.c : CreateClient.init}
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

    case "create": {
      switch (modelSync.t) {
        case "create": {
          return (
            <CreateClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {} }}
              dispatch={(c) => dispatch({ t: "create", c })}
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
