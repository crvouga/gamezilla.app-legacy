import { Sub } from "gamezilla/@SHARED/core";
import {
  SpaceClientCtx,
  GameClient,
  SpaceViewCtx,
} from "gamezilla/app/space/@SHARED";
import { ConnectFourClient } from "gamezilla/app/space/game/connect-four";
import {
  ClientModel,
  ClientMsg,
  Evt,
  State,
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

type Client = GameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State,
  Evt,
  SpaceViewCtx,
  SpaceClientCtx
>;

const ConnectFour = GameClient.tag("connect-four", ConnectFourClient);

//
//
//
// Model
//
//
//

export const init: Client["init"] = (input) => {
  const { state } = input;

  switch (state.t) {
    case "connect-four": {
      return ConnectFour.init({ ...input, state });
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

  if (
    state.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.update({ state, ctx, msg, model });
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, msg, model, state } = input;

  if (
    state.t === "connect-four" &&
    msg.t === "connect-four" &&
    model.t === "connect-four"
  ) {
    return ConnectFour.updateFromServer({ ...input, msg, model });
  }

  return { model };
};

export const updateFromGame: Client["updateFromGame"] = (input) => {
  const { state, model } = input;

  if (!model) {
    return init(input);
  }

  if (state.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromGame({ ...input, state, model });
  }

  return init(input);
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  const { state, model } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromEvent(input);
  }

  return input;
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
  const { model, ctx, state, dispatch, dispatchEvent } = input;

  console.log(state);
  if (state.t === "connect-four") {
    return (
      <ConnectFourClient.View
        ctx={ctx}
        dispatch={(c) => dispatch({ t: "connect-four", c })}
        state={state.c}
        model={model.c}
        dispatchEvent={(c) => dispatchEvent({ t: "connect-four", c })}
      />
    );
  }

  return null;
};
