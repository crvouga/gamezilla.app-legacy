import { Cmd, Err, Ok, Sub, andThen, p } from "gamezilla/@/core";
import { SpaceMsg, GameSpaceReqCtx } from "gamezilla/app/space/@";
import { TicTacToe } from "../tic-tic-toe";
import { getBestMove } from "../tic-tic-toe/best-move";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initCoreModel,
  isBotTurn,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initCoreModel;

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
  broadcast: (msg: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "bot-moved") {
    if (msg.result.t === "err") {
      return { model, cmd: broadcast({ t: "bot-moved", result: msg.result }) };
    }

    if (model.type !== "game") {
      return {
        model,
        cmd: broadcast({
          t: "bot-moved",
          result: Err("The bot moved not during game mode"),
        }),
      };
    }

    const moved = TicTacToe.move({
      position: msg.result.value,
      board: model.board,
      player: TicTacToe.toOpposite(model.userPlayerType),
    });

    if (moved.t === "err") {
      return { model, cmd: broadcast({ t: "bot-moved", result: moved }) };
    }

    const modelNew: Model = {
      ...model,
      board: moved.value,
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "bot-moved", result: Ok(modelNew) }),
    };
  }
  return { model };
};

//
//
//
//
//

export const updateFromClient = (input: {
  sendToClient: (m: ToClient) => Cmd;
  broadcast: (m: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
  ctx: GameSpaceReqCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    input,
    andThen((model) => updateFromClient_({ ...input, model })),
    andThen((model) => watchBotMove({ model, modelPrev: input.model }))
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
  if (!isBotTurn(modelPrev) && isBotTurn(model)) {
    return {
      model,
      cmd: p(
        getBestMove({
          depth: TicTacToe.toDepth(model.botLevel),
          maximizingPlayer: TicTacToe.toOpposite(model.userPlayerType),
          board: model.board,
        }),
        Cmd.perform((result) => ({ t: "bot-moved", result }))
      ),
    };
  }
  return { model };
};

const updateFromClient_ = ({
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: GameSpaceReqCtx;
  sendToClient: (m: ToClient) => Cmd;
  broadcast: (m: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
}): {
  cmd?: Cmd<Msg>;
  model: Model;
} => {
  const handled = handle({ ctx, model, msg });
  const res: Res = { ...msg, result: handled };
  const modelNew: Model = handled.t === "ok" ? handled.value : model;
  return {
    model: modelNew,
    cmd: broadcast(res),
  };
};

export const updateFromParent = ({
  broadcast,
  msg,
  model,
}: {
  msg: SpaceMsg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
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
      player: null,
      userPlayerType: model.userPlayerType,
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "player-left", result: Ok(modelNew) }),
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
