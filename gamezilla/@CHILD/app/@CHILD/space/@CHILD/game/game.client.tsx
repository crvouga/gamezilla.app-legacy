import {
  GameClient,
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { Sub } from "gamezilla/@SHARED/core";
import * as ChessClient from "./@CHILD/chess/chess.client";
import * as ConnectFourClient from "./@CHILD/connect-four/connect-four.client";
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

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx;
}>;

const ConnectFour = GameClient.tag("connect-four", ConnectFourClient);
const Chess = GameClient.tag("chess", ChessClient);

//
//
//
// Model
//
//
//

export const init: Client["init"] = (input) => {
  const { state, model } = input;

  switch (state.t) {
    case "connect-four": {
      return ConnectFour.init({
        ...input,
        state,
        model: model?.t === "connect-four" ? model : null,
      });
    }

    case "chess": {
      return Chess.init({
        ...input,
        state,
        model: model?.t === "chess" ? model : null,
      });
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

export const update: Client["update"] = (input) => {
  return GameClient.chain(
    init(input),

    (model) => {
      const { state, ctx, msg, serverMsg, evt, gameEvent } = input;
      switch (state.t) {
        case "chess": {
          return Chess.update({
            state: state,
            ctx,
            model: model?.t === "chess" ? model : undefined,
            msg: msg?.t === "chess" ? msg : undefined,
            gameEvent: gameEvent?.t === "chess" ? gameEvent : undefined,
            serverMsg: serverMsg?.t === "chess" ? serverMsg : undefined,
            evt: evt,
          });
        }

        case "connect-four": {
          return ConnectFour.update({
            state,
            ctx,
            model: model?.t === "connect-four" ? model : undefined,
            msg: msg?.t === "connect-four" ? msg : undefined,
            gameEvent: gameEvent?.t === "connect-four" ? gameEvent : undefined,
            serverMsg: serverMsg?.t === "connect-four" ? serverMsg : undefined,
            evt: evt,
          });
        }
      }
    }
  );
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (
  input
): Sub<ClientMsg> => {
  const { state, model } = input;
  switch (state.t) {
    case "chess": {
      return Chess.subscriptions({
        ...input,
        state,
        model: model?.t === "chess" ? model : undefined,
      });
    }

    case "connect-four": {
      return ConnectFour.subscriptions({
        ...input,
        state,
        model: model?.t === "connect-four" ? model : undefined,
      });
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

export const View: Client["View"] = (input) => {
  const { model, ctx, state, dispatch } = input;

  switch (state.t) {
    case "chess": {
      return (
        <Chess.View
          ctx={ctx}
          dispatch={dispatch}
          state={state}
          model={model?.t === "chess" ? model : undefined}
        />
      );
    }
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={dispatch}
          state={state}
          model={model?.t === "connect-four" ? model : undefined}
        />
      );
    }
  }
};

export const viewEvent: Client["viewEvent"] = (input) => {
  const { event, ctx } = input;
  if (event.t === "connect-four") {
    return ConnectFour.viewEvent?.({ ctx, event }) ?? null;
  }

  return null;
};
