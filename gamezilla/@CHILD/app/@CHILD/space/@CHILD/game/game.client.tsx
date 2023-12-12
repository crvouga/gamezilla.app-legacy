import {
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { Sub } from "gamezilla/@SHARED/core";
// import * as ChessClient from "./@CHILD/chess/chess.client";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { GameClientModule } from "../../@SHARED/architecture/game-client-v2";
import * as ConnectFour from "./@CHILD/connect-four/connect-four.client";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
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
  InEvt: SpaceClientEvt;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvt: null;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = (input) => {
  const { gameState } = input;

  switch (gameState.t) {
    case "connect-four": {
      const initial = ConnectFour.init({
        ctx: input.ctx,
        model: input.model?.t === "connect-four" ? input.model.c : null,
        gameState: gameState.c,
      });

      const tagged = GameClientModule.tagOutput(
        "connect-four",
        (cmd) => ClientCmd.tag("connect-four", cmd),
        initial
      );

      return tagged;
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

export const update: Module["update"] = (input) => {
  const { ctx, msg, fromServer, cmd, evt, gameEvent, gameState } = input;

  switch (gameState.t) {
    case "connect-four": {
      const updated = ConnectFour.update({
        ctx,
        gameState: gameState.c,
        model: input.model?.t === "connect-four" ? input.model.c : null,
        cmd: cmd,
        evt: evt,
        fromServer: fromServer?.t === "connect-four" ? fromServer.c : null,
        gameEvent:
          gameEvent?.t === "connect-four"
            ? { ...gameEvent, ...gameEvent.c }
            : null,
        msg: msg?.t === "connect-four" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "connect-four",
        (cmd) => ClientCmd.tag("connect-four", cmd),
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

export const subscriptions: Module["subscriptions"] = (
  input
): Sub<ClientMsg> => {
  const { gameState, model } = input;
  switch (gameState.t) {
    case "connect-four": {
      return Sub.tag(
        "connect-four",
        ConnectFour.subscriptions({
          ctx: input.ctx,
          gameState: gameState.c,
          model: model?.t === "connect-four" ? model.c : null,
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

export const View: Module["View"] = (input) => {
  const { model, ctx, gameState, dispatch } = input;

  switch (gameState.t) {
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
          gameState={gameState.c}
          model={model?.t === "connect-four" ? model.c : null}
        />
      );
    }
  }
};

export const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { gameEvent, gameState, ctx, dispatch } = input;

  switch (gameState.t) {
    case "connect-four": {
      switch (gameEvent.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem
              ctx={ctx}
              gameEvent={gameEvent.c}
              gameState={gameState.c}
              dispatch={(c) => dispatch({ t: "connect-four", c })}
              model={input.model?.t === "connect-four" ? input.model.c : null}
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
