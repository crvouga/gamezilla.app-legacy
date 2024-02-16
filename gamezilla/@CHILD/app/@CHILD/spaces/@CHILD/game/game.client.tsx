import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { Sub } from "gamezilla/@SHARED/core"
import { GameClientModule } from "../../@SHARED/architecture/game-client-v2"
import { SpaceClientCmd } from "../../@SHARED/space-client-cmd"
import { ConnectFour } from "./@CHILD/connect-four/connect-four.client"
import { FlowClient } from "./@CHILD/flow/flow.client"
import {
  GameName,
  ModelClient,
  ModelGame,
  MsgClient,
  MsgGame,
  MsgToClient,
  MsgToServer,
} from "./game.core"

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
  ModelGame: ModelGame
  MsgGame: MsgGame
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

const init = (gameName: GameName): Module["init"] => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.init,
      }
    }

    case "flow": {
      return {
        t: "flow",
        c: FlowClient.init,
      }
    }
  }
}

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  const { ctx, msg, msgServer, msgCmd, msgEvt, msgGame, modelGame } = input

  switch (modelGame.t) {
    case "connect-four": {
      const updated = ConnectFour.update({
        ctx,
        modelGame: modelGame.c,
        model:
          input.model?.t === "connect-four" ? input.model.c : ConnectFour.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "connect-four" ? msgServer.c : null,
        msgGame:
          msgGame?.t === "connect-four" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "connect-four" ? msg.c : null,
      })

      const tagged = GameClientModule.tagOutput(
        "connect-four",
        (msgCmd) => SpaceClientCmd.tag("connect-four", msgCmd),
        updated,
      )

      return tagged
    }

    case "flow": {
      const updated = FlowClient.update({
        ctx: ctx,
        modelGame: modelGame.c,
        model: input.model?.t === "flow" ? input.model.c : FlowClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "flow" ? msgServer.c : null,
        msgGame: msgGame?.t === "flow" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "flow" ? msg.c : null,
      })

      const tagged = GameClientModule.tagOutput(
        "flow",
        (msgCmd) => SpaceClientCmd.tag("flow", msgCmd),
        updated,
      )

      return tagged
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

const subscriptions: Module["subscriptions"] = (input): Sub<MsgClient> => {
  const { modelGame, model } = input

  switch (modelGame.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        ConnectFour.subscriptions({
          ctx: input.ctx,
          modelGame: modelGame.c,
          model: model.t === "connect-four" ? model.c : ConnectFour.init,
        }),
      )
    }

    case "flow": {
      return Sub.tag(
        "flow",
        FlowClient.subscriptions({
          ctx: input.ctx,
          modelGame: modelGame.c,
          model: model.t === "flow" ? model.c : FlowClient.init,
        }),
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

const View: Module["View"] = (input) => {
  const { model, ctx, modelGame, dispatch } = input

  switch (modelGame.t) {
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
          modelGame={modelGame.c}
          model={model?.t === "connect-four" ? model.c : ConnectFour.init}
        />
      )
    }

    case "flow": {
      return (
        <FlowClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "flow", c })}
          modelGame={modelGame.c}
          model={model.t === "flow" ? model.c : FlowClient.init}
        />
      )
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { msgGame, modelGame, ctx, dispatch } = input

  switch (modelGame.t) {
    case "connect-four": {
      switch (msgGame.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              msgGame={msgGame.c}
              modelGame={modelGame.c}
              dispatch={(c) => dispatch({ t: "connect-four", c })}
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

export const Game = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
}
