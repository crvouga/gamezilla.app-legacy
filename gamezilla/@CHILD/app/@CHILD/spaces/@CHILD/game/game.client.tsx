import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import { GameClientModule } from "../../@SHARED/architecture/game-client-v2";
import { ConnectFour } from "./@CHILD/connect-four/connect-four.client";
import { Flow } from "./@CHILD/flow/flow.client";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameName,
  GameState,
  ToClient,
  ToServer,
} from "./game.core";

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceClientCtx;
  InCmd: null;
  InEvent: SpaceClientEvent;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvent: null;
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
        c: ConnectFour.init,
      };
    }

    case "flow": {
      return {
        t: "flow",
        c: Flow.init,
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

const update: Module["update"] = (input) => {
  const { ctx, msg, msgFromServer, msgCmd, msgEvent, msgGameEvent, gameState } =
    input;

  switch (gameState.t) {
    case "connect-four": {
      const updated = ConnectFour.update({
        ctx,
        gameState: gameState.c,
        model:
          input.model?.t === "connect-four" ? input.model.c : ConnectFour.init,
        msgCmd: msgCmd,
        msgEvent: msgEvent,
        msgFromServer:
          msgFromServer?.t === "connect-four" ? msgFromServer.c : null,
        msgGameEvent:
          msgGameEvent?.t === "connect-four"
            ? { ...msgGameEvent, ...msgGameEvent.c }
            : null,
        msg: msg?.t === "connect-four" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "connect-four",
        (msgCmd) => ClientCmd.tag("connect-four", msgCmd),
        updated
      );

      return tagged;
    }

    case "flow": {
      const updated = Flow.update({
        ctx: ctx,
        gameState: gameState.c,
        model: input.model?.t === "flow" ? input.model.c : Flow.init,
        msgCmd: msgCmd,
        msgEvent: msgEvent,
        msgFromServer: msgFromServer?.t === "flow" ? msgFromServer.c : null,
        msgGameEvent:
          msgGameEvent?.t === "flow"
            ? { ...msgGameEvent, ...msgGameEvent.c }
            : null,
        msg: msg?.t === "flow" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "flow",
        (msgCmd) => ClientCmd.tag("flow", msgCmd),
        updated
      );

      return tagged;
    }
  }
};

//
//
//
// Subscriptions
//
//
//

const subscriptions: Module["subscriptions"] = (input): Sub<ClientMsg> => {
  const { gameState, model } = input;

  switch (gameState.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        ConnectFour.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model: model.t === "connect-four" ? model.c : ConnectFour.init,
        })
      );
    }

    case "flow": {
      return Sub.tag(
        "flow",
        Flow.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model: model.t === "flow" ? model.c : Flow.init,
        })
      );
    }
  }
};

//
//
//
// View
//
//
//

const View: Module["View"] = (input) => {
  const { model, ctx, gameState, dispatch } = input;

  switch (gameState.t) {
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
          gameState={gameState.c}
          model={model?.t === "connect-four" ? model.c : ConnectFour.init}
        />
      );
    }

    case "flow": {
      return (
        <Flow.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "flow", c })}
          gameState={gameState.c}
          model={model.t === "flow" ? model.c : Flow.init}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { msgGameEvent, gameState, ctx, dispatch } = input;

  switch (gameState.t) {
    case "connect-four": {
      switch (msgGameEvent.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              msgGameEvent={msgGameEvent.c}
              gameState={gameState.c}
              dispatch={(c) => dispatch({ t: "connect-four", c })}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    default: {
      return null;
    }
  }
};

export const Game = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
};
