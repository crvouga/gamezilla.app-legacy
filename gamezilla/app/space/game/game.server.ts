import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ChessServer } from "gamezilla/app/space/game/chess";
import { ConnectFourServer } from "gamezilla/app/space/game/connect-four";
import { FlowServer } from "gamezilla/app/space/game/flow";
import { TicTacToeServer } from "gamezilla/app/space/game/tic-tac-toe";
import { SpaceGameServer, SpaceServerCmd } from "gamezilla/app/space/@SHARED";
import {
  State,
  Evt,
  ServerModel,
  ServerMsg,
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
