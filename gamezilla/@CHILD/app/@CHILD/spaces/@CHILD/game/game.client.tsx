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
  ModelSync,
  MsgClient,
  MsgSync,
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
  const { ctx, msg, msgServer, msgCmd, msgEvt, msgSync, modelSync } = input

  switch (modelSync.t) {
    case "connect-four": {
      const updated = ConnectFour.update({
        ctx,
        modelSync: modelSync.c,
        model:
          input.model?.t === "connect-four" ? input.model.c : ConnectFour.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "connect-four" ? msgServer.c : null,
        msgSync:
          msgSync?.t === "connect-four" ? { ...msgSync, ...msgSync.c } : null,
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
        modelSync: modelSync.c,
        model: input.model?.t === "flow" ? input.model.c : FlowClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "flow" ? msgServer.c : null,
        msgSync: msgSync?.t === "flow" ? { ...msgSync, ...msgSync.c } : null,
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

const subscriptions: Module["subscriptions"] = async (input) => {
  const { modelSync, model } = input

  switch (modelSync.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        await ConnectFour.subscriptions({
          ctx: input.ctx,
          modelSync: modelSync.c,
          model: model.t === "connect-four" ? model.c : ConnectFour.init,
        }),
      )
    }

    case "flow": {
      return Sub.tag(
        "flow",
        await FlowClient.subscriptions({
          ctx: input.ctx,
          modelSync: modelSync.c,
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
  const { model, ctx, modelSync, dispatch } = input

  switch (modelSync.t) {
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
          modelSync={modelSync.c}
          model={model?.t === "connect-four" ? model.c : ConnectFour.init}
        />
      )
    }

    case "flow": {
      return (
        <FlowClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "flow", c })}
          modelSync={modelSync.c}
          model={model.t === "flow" ? model.c : FlowClient.init}
        />
      )
    }
  }
}

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { msgSync, modelSync, ctx, dispatch } = input

  switch (modelSync.t) {
    case "connect-four": {
      switch (msgSync.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              msgSync={msgSync.c}
              modelSync={modelSync.c}
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
