import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
import { ConnectFourServer } from "gamezilla/app/space/game/connect-four";
import {
  Evt,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
} from "./game.core";

type Server = GameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

const ConnectFour = GameServer.tag("connect-four", ConnectFourServer);

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
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

export const update: Server["update"] = (input) => {
  const { msg, state, model } = input;

  if (
    state.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.update({ ...input, msg, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { state, msg, model } = input;

  if (
    state.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.updateFromClient({ ...input, msg, model, state });
  }

  return { model };
};

export const updateFromEvent: Server["updateFromEvent"] = (input) => {
  const { model, state } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromEvent({ ...input, state, model });
  }

  return { model };
};

export const updateFromGame: Server["updateFromGame"] = async (input) => {
  const { model, prev, next, msg } = input;

  if (
    next.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.updateFromGame({
      ...input,
      prev: prev?.t === "connect-four" ? prev : null,
      next: next,
      model,
      msg,
    });
  }

  return { model };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (input) => {
  const { state, model } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return await ConnectFour.subscriptions({ ...input, state, model });
  }

  return Sub.None;
};
