import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameServer } from "gamezilla/app/space/@SHARED";
import { ConnectFourServer } from "gamezilla/app/space/game/connect-four";
import {
  Evt,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
} from "./game.core";

type Server = SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

const ConnectFour = SpaceGameServer.tag("connect-four", ConnectFourServer);

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

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
  const { model, state } = input;

  if (state.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromEvt({ ...input, state, model });
  }

  return { model };
};

export const updateFromGameEvt: Server["updateFromGameEvt"] = (input) => {
  const { model, before, after, msg } = input;

  if (
    before.t === "connect-four" &&
    after.t === "connect-four" &&
    model.t === "connect-four" &&
    msg.t === "connect-four"
  ) {
    return ConnectFour.updateFromGameEvt({
      ...input,
      before,
      after,
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
