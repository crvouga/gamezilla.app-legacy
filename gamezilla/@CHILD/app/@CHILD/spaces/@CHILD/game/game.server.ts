import { Sub } from "gamezilla/@SHARED/core"
import { GameServerModule } from "../../@SHARED/architecture/game-server-v2"
import { SpaceServerCtx, SpaceServerEvent } from "../../@SHARED/space"
import { SpaceServerCmd } from "../../@SHARED/space-server-cmd"
import { FlowServer } from "./@CHILD/flow/flow.server"
import {
  MsgGame,
  GameName,
  ModelGame,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./game.core"
import { ConnectFourServer } from "./@CHILD/connect-four/connect-four.server"

//
//
//
//
//
//
//

type Module = GameServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ModelGame: ModelGame
  MsgGame: MsgGame
  Ctx: SpaceServerCtx
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  Deps: null
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
        c: ConnectFourServer.init,
      }
    }

    case "flow": {
      return {
        t: "flow",
        c: FlowServer.init,
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

export const update: Module["update"] = async (input) => {
  const { modelGame, ctx, model } = input

  return GameServerModule.chainUpdates({ model }, async (model) => {
    switch (modelGame.t) {
      case "flow": {
        const updated = await FlowServer.update({
          ctx,
          modelGame: modelGame.c,
          model: model.t === "flow" ? model.c : FlowServer.init,
          msgCmd: input.msgCmd,
          msgEvt: input.msgEvt,
          msgClient:
            input.msgClient?.t === "flow"
              ? { ...input.msgClient, ...input.msgClient.c }
              : null,
          msgGame:
            input.msgGame?.t === "flow"
              ? { ...input.msgGame, ...input.msgGame.c }
              : null,
          msg: input.msg?.t === "flow" ? input.msg.c : null,
          deps: null,
        })

        const tagged = GameServerModule.tagOutput(
          "flow",
          (msgCmd) => SpaceServerCmd.tag("flow", msgCmd),
          updated,
        )

        return tagged
      }

      case "connect-four": {
        const updated = await ConnectFourServer.update({
          ctx,
          modelGame: modelGame.c,
          model: model.t === "connect-four" ? model.c : ConnectFourServer.init,
          msgCmd: input.msgCmd,
          msgEvt: input.msgEvt,
          msgClient:
            input.msgClient?.t === "connect-four"
              ? { ...input.msgClient, ...input.msgClient.c }
              : null,
          msgGame:
            input.msgGame?.t === "connect-four"
              ? { ...input.msgGame, ...input.msgGame.c }
              : null,
          msg: input.msg?.t === "connect-four" ? input.msg.c : null,
          deps: null,
        })

        const tagged = GameServerModule.tagOutput(
          "connect-four",
          (msgCmd) => SpaceServerCmd.tag("connect-four", msgCmd),
          updated,
        )

        return tagged
      }
    }
  })
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Module["subscriptions"] = async (input) => {
  const { modelGame, model } = input

  switch (modelGame.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        await ConnectFourServer.subscriptions({
          ...input,
          modelGame: modelGame.c,
          model: model?.t === "connect-four" ? model.c : ConnectFourServer.init,
        }),
      )
    }

    case "flow": {
      return Sub.tag(
        "flow",
        await FlowServer.subscriptions({
          ...input,
          modelGame: modelGame.c,
          model: model?.t === "flow" ? model.c : FlowServer.init,
        }),
      )
    }
  }
}

export const Game = {
  init,
  update,
  subscriptions,
  deps: null,
}
