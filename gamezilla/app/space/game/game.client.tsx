import { Sub } from "gamezilla/@SHARED/core";
import { SpaceClientCtx, SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { ChessClient } from "gamezilla/app/space/game/chess";
import { ConnectFourClient } from "gamezilla/app/space/game/connect-four";
import { FlowClient } from "gamezilla/app/space/game/flow";
import { TicTacToeClient } from "gamezilla/app/space/game/tic-tac-toe";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
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

type Client = SpaceGameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

const ConnectFour = SpaceGameClient.tag("connect-four", ConnectFourClient);
const Flow = SpaceGameClient.tag("flow", FlowClient);
const TicTacToe = SpaceGameClient.tag("tic-tac-toe", TicTacToeClient);
const Chess = SpaceGameClient.tag("chess", ChessClient);

//
//
//
// Model
//
//
//

export const init = (input: {
  ctx: SpaceClientCtx;
  gameName: ClientModel["t"];
}): ReturnType<Client["init"]> => {
  switch (input.gameName) {
    case "tic-tac-toe": {
      return TicTacToe.init(input);
    }

    case "connect-four": {
      return ConnectFour.init(input);
    }

    case "chess": {
      return Chess.init(input);
    }

    case "flow": {
      return Flow.init(input);
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
  const { ctx, msg, model } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.update({ ctx, msg, model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    return TicTacToe.update({ ctx, msg, model });
  }

  if (model.t === "chess" && msg.t === "chess") {
    return Chess.update({ ctx, msg, model });
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.update({ ctx, msg, model });
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, msg, model } = input;

  if (msg.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromServer({ ...input, msg, model });
  }

  if (msg.t === "tic-tac-toe" && model.t === "tic-tac-toe") {
    return TicTacToe.updateFromServer({ ...input, msg, model });
  }

  if (msg.t === "chess" && model.t === "chess") {
    return Chess.updateFromServer({ ctx, msg, model });
  }

  if (msg.t === "flow" && model.t === "flow") {
    return Flow.updateFromServer({ ...input, msg, model });
  }

  return { model };
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
  const { model } = input;

  switch (model.t) {
    case "chess": {
      return Chess.updateFromEvt({ ...input, model });
    }

    case "connect-four": {
      return ConnectFour.updateFromEvt({ ...input, model });
    }

    case "flow": {
      return Flow.updateFromEvt({ ...input, model });
    }

    case "tic-tac-toe": {
      return TicTacToe.updateFromEvt({ ...input, model });
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

export const subscriptions: Client["subscriptions"] = (input): Sub<Msg> => {
  const { model } = input;

  switch (model.t) {
    case "chess": {
      return Chess.subscriptions({ ...input, model });
    }

    case "connect-four": {
      return ConnectFour.subscriptions({ ...input, model });
    }

    case "tic-tac-toe": {
      return TicTacToe.subscriptions({ ...input, model });
    }
    case "flow": {
      return Flow.subscriptions({ ...input, model });
    }
  }
};

//
//
//
//
//
//

export const mergeWithServer: Client["mergeWithServer"] = (input) => {
  const { client, server } = input;
  switch (server.t) {
    case "chess": {
      return Chess.mergeWithServer({
        ...input,
        client: client?.t === "chess" ? client : undefined,
        server: server,
      });
    }

    case "connect-four": {
      return ConnectFour.mergeWithServer({
        ...input,
        server,
        client: client?.t === "connect-four" ? client : undefined,
      });
    }

    case "tic-tac-toe": {
      return TicTacToe.mergeWithServer({
        ...input,
        client: client?.t === "tic-tac-toe" ? client : undefined,
        server: server,
      });
    }

    case "flow": {
      return Flow.mergeWithServer({
        ...input,
        client: client?.t === "flow" ? client : null,
        server: server,
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
  const { model } = input;

  switch (model.t) {
    case "connect-four": {
      return <ConnectFour.View {...input} model={model} />;
    }

    case "tic-tac-toe": {
      return <TicTacToe.View {...input} model={model} />;
    }

    case "chess": {
      return <Chess.View {...input} model={model} />;
    }

    case "flow": {
      return <Flow.View {...input} model={model} />;
    }
  }
};
