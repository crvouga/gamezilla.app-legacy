import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub, chain } from "gamezilla/@SHARED/core";
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
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
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

export type Msg = ClientMsg;

export const update: Client["update"] = (input) => {
  const { state, ctx, msg, model } = input;

  return chain(init(input), (model) => {
    switch (state.t) {
      case "chess": {
        if (state.t === "chess" && model.t === "chess" && msg.t === "chess") {
          return Chess.update({ state, ctx, msg, model });
        }
        return { model };
      }

      case "connect-four": {
        if (
          state.t === "connect-four" &&
          model.t === "connect-four" &&
          msg.t === "connect-four"
        ) {
          return ConnectFour.update({ state, ctx, msg, model });
        }
        return { model };
      }
    }
  });
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { msg, model, state } = input;

  return chain(init(input), (model) => {
    if (
      state.t === "connect-four" &&
      msg.t === "connect-four" &&
      model.t === "connect-four"
    ) {
      return ConnectFour.updateFromServer({ ...input, msg, model, state });
    }

    if (state.t === "chess" && msg.t === "chess" && model.t === "chess") {
      return Chess.updateFromServer({ ...input, msg, model, state });
    }

    return { model };
  });
};

export const updateFromGame: Client["updateFromGame"] = (input) => {
  const { state, msg } = input;

  return chain(init(input), (model) => {
    if (
      state.t === "connect-four" &&
      model.t === "connect-four" &&
      msg.t === "connect-four"
    ) {
      return ConnectFour.updateFromGame({ ...input, msg, state, model });
    }

    if (state.t === "chess" && model.t === "chess" && msg.t === "chess") {
      return Chess.updateFromGame({ ...input, msg, state, model });
    }

    return { model };
  });
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  const { state, model } = input;

  return chain(init(input), (model) => {
    if (state.t === "connect-four" && model.t === "connect-four") {
      return ConnectFour.updateFromEvent({ ...input, state, model });
    }

    if (state.t === "chess" && model.t === "chess") {
      return Chess.updateFromEvent({ ...input, state, model });
    }

    return input;
  });
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (input): Sub<Msg> => {
  const { state, model } = input;

  if (model.t === "connect-four" && state.t === "connect-four") {
    return ConnectFour.subscriptions({ ...input, state, model });
  }

  return Sub.None;
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

  if (state.t === "chess" && model.t === "chess") {
    return (
      <Chess.View ctx={ctx} dispatch={dispatch} state={state} model={model} />
    );
  }

  if (state.t === "connect-four" && model.t === "connect-four") {
    return (
      <ConnectFour.View
        ctx={ctx}
        dispatch={dispatch}
        state={state}
        model={model}
      />
    );
  }

  return null;
};

export const viewEvent: Client["viewEvent"] = (input) => {
  const { event, ctx } = input;
  if (event.t === "connect-four") {
    return ConnectFour.viewEvent?.({ ctx, event }) ?? null;
  }

  return null;
};
