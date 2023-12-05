import { GameClient } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture";
import {
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
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
      const { state, ctx, msg, serverMsg, evt, gameEvent, stateBefore } = input;

      switch (state.t) {
        case "chess": {
          return Chess.update({
            state: state,
            ctx,
            model: model?.t === "chess" ? model : null,
            msg: msg?.t === "chess" ? msg : null,
            gameEvent: gameEvent?.t === "chess" ? gameEvent : null,
            serverMsg: serverMsg?.t === "chess" ? serverMsg : null,
            evt: evt,
            stateBefore: stateBefore.t === "chess" ? stateBefore : state,
          });
        }

        case "connect-four": {
          return ConnectFour.update({
            state,
            ctx,
            model: model?.t === "connect-four" ? model : null,
            msg: msg?.t === "connect-four" ? msg : null,
            gameEvent: gameEvent?.t === "connect-four" ? gameEvent : null,
            serverMsg: serverMsg?.t === "connect-four" ? serverMsg : null,
            stateBefore: stateBefore.t === "connect-four" ? stateBefore : state,
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
        model: model?.t === "chess" ? model : null,
      });
    }

    case "connect-four": {
      return ConnectFour.subscriptions({
        ...input,
        state,
        model: model?.t === "connect-four" ? model : null,
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
          model={model?.t === "chess" ? model : null}
        />
      );
    }
    case "connect-four": {
      return (
        <ConnectFour.View
          ctx={ctx}
          dispatch={dispatch}
          state={state}
          model={model?.t === "connect-four" ? model : null}
        />
      );
    }
  }
};

export const ViewFeedItem: Client["ViewFeedItem"] = (input) => {
  const { state, event, ctx } = input;

  switch (event.t) {
    case "connect-four": {
      switch (state.t) {
        case "connect-four": {
          return (
            <ConnectFour.ViewFeedItem ctx={ctx} event={event} state={state} />
          );
        }

        default: {
          return null;
        }
      }
    }

    case "chess": {
      return null;
    }
  }
};
