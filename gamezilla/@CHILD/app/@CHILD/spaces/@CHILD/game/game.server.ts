import { Sub } from "gamezilla/@SHARED/core";
import { GameServerModule } from "../../@SHARED/architecture/game-server-v2";
import { SpaceServerCtx, SpaceServerEvent } from "../../@SHARED/space";
import { SpaceServerCmd } from "../../@SHARED/space-server-cmd";
import { FlowServer } from "./@CHILD/flow/flow.server";
import {
  GameEvent,
  GameName,
  GameState,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./game.core";
import { ConnectFourServer } from "./@CHILD/connect-four/connect-four.server";

//
//
//
//
//
//
//

type Module = GameServerModule<{
  Model: ServerModel;
  Msg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
  Deps: null;
}>;

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
      };
    }

    case "flow": {
      return {
        t: "flow",
        c: FlowServer.init,
      };
    }
  }
};

//
//
//
// Update
//
//
//

export const update: Module["update"] = async (input) => {
  const { gameState, ctx, model } = input;

  return GameServerModule.chainUpdates({ model }, async (model) => {
    switch (gameState.t) {
      case "flow": {
        const updated = await FlowServer.update({
          ctx,
          gameState: gameState.c,
          model: model.t === "flow" ? model.c : FlowServer.init,
          msgCmd: input.msgCmd,
          msgEvent: input.msgEvent,
          fromClient:
            input.fromClient?.t === "flow"
              ? { ...input.fromClient, ...input.fromClient.c }
              : null,
          msgGameEvent:
            input.msgGameEvent?.t === "flow"
              ? { ...input.msgGameEvent, ...input.msgGameEvent.c }
              : null,
          msg: input.msg?.t === "flow" ? input.msg.c : null,
          deps: null,
        });

        const tagged = GameServerModule.tagOutput(
          "flow",
          (msgCmd) => SpaceServerCmd.tag("flow", msgCmd),
          updated
        );

        return tagged;
      }

      case "connect-four": {
        const updated = await ConnectFourServer.update({
          ctx,
          gameState: gameState.c,
          model: model.t === "connect-four" ? model.c : ConnectFourServer.init,
          msgCmd: input.msgCmd,
          msgEvent: input.msgEvent,
          fromClient:
            input.fromClient?.t === "connect-four"
              ? { ...input.fromClient, ...input.fromClient.c }
              : null,
          msgGameEvent:
            input.msgGameEvent?.t === "connect-four"
              ? { ...input.msgGameEvent, ...input.msgGameEvent.c }
              : null,
          msg: input.msg?.t === "connect-four" ? input.msg.c : null,
          deps: null,
        });

        const tagged = GameServerModule.tagOutput(
          "connect-four",
          (msgCmd) => SpaceServerCmd.tag("connect-four", msgCmd),
          updated
        );

        return tagged;
      }
    }
  });
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Module["subscriptions"] = async (input) => {
  const { gameState, model } = input;

  switch (gameState.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        await ConnectFourServer.subscriptions({
          ...input,
          gameState: gameState.c,
          model: model?.t === "connect-four" ? model.c : ConnectFourServer.init,
        })
      );
    }

    case "flow": {
      return Sub.tag(
        "flow",
        await FlowServer.subscriptions({
          ...input,
          gameState: gameState.c,
          model: model?.t === "flow" ? model.c : FlowServer.init,
        })
      );
    }
  }
};

export const Game = {
  init,
  update,
  subscriptions,
  deps: null,
};
