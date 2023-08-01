import { andThen, Cmd, Ok, p, Sub } from "@gamezilla/core";
import { GameSpaceMsg, GameSpaceReqCtx } from "@gamezilla/shared/game-space";
import { findBestMove } from "../connect-four";
import {
  updateCore,
  handleBotMove,
  initCore,
  isBotTurn,
  Res,
  ServerModel,
  ServerMsg,
  toBotPlayer,
  ToClient,
  ToServer,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initCore;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "bot-moved") {
    const result = handleBotMove(msg.result, model);

    if (result.t === "err") {
      return { model, cmd: broadcast({ t: "bot-move", result }) };
    }

    return { model: result.value, cmd: broadcast({ t: "bot-move", result }) };
  }

  return { model };
};

export const updateFromClient = (input: {
  broadcast: (msg: ToClient) => Cmd;
  sendToClient: (msg: ToClient) => Cmd;
  ctx: GameSpaceReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen(({ model }) => updateFromClient_({ ...input, model })),
    andThen(({ model }) => watchBotMove({ model, modelPrev: input.model }))
  );
};

const watchBotMove = ({
  model,
  modelPrev,
}: {
  model: Model;
  modelPrev: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (!isBotTurn(modelPrev) && isBotTurn(model) && model.type === "game") {
    const columns = model.columns;
    const botPlayer = toBotPlayer(model);
    return {
      model,
      cmd: async (dispatch) => {
        const result = findBestMove({
          columns,
          maximizingPlayer: botPlayer,
          maxDepth: 4,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch({ t: "bot-moved", result: Ok(result.columnIndex) });
      },
    };
  }

  return {
    model,
  };
};

const updateFromClient_: typeof updateFromClient = ({
  broadcast,
  sendToClient,
  ctx,
  msg,
  model,
}) => {
  const res: Res = {
    ...msg,
    result: updateCore({ ctx, msg, model }),
  };

  if (res.result.t === "err") {
    return { model, cmd: sendToClient(res) };
  }

  return { model: res.result.value, cmd: broadcast(res) };
};

export const updateFromParent = ({
  msg,
  model,
  broadcast,
}: {
  broadcast: (m: ToClient) => Cmd;
  msg: GameSpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "user-left") {
    if (model.player !== msg.userId) {
      return { model };
    }

    const modelNew: Model = {
      type: "setup",
      botLevel: model.botLevel,
      userPlayerType: model.userPlayerType,
      player: null,
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "player-left", model: modelNew }),
    };
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
