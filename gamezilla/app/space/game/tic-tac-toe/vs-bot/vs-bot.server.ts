import { Eff, Err, Ok, Sub, andThen, p } from "gamezilla/@SHARED/core";
import { SpaceEvent, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
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
  broadcast: (msg: ToClient) => Eff;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "bot-moved") {
    if (msg.result.t === "err") {
      return { model, eff: broadcast({ t: "bot-moved", result: msg.result }) };
    }

    if (model.type !== "game") {
      return {
        model,
        eff: broadcast({
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
      return { model, eff: broadcast({ t: "bot-moved", result: moved }) };
    }

    const modelNew: Model = {
      ...model,
      board: moved.value,
    };

    return {
      model: modelNew,
      eff: broadcast({ t: "bot-moved", result: Ok(modelNew) }),
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
  sendToClient: (m: ToClient) => Eff;
  broadcast: (m: ToClient) => Eff;
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
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
  eff?: Eff<Msg>;
} => {
  if (!isBotTurn(modelPrev) && isBotTurn(model)) {
    return {
      model,
      eff: p(
        getBestMove({
          depth: TicTacToe.toDepth(model.botLevel),
          maximizingPlayer: TicTacToe.toOpposite(model.userPlayerType),
          board: model.board,
        }),
        Eff.perform((result) => ({ t: "bot-moved", result }))
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
  ctx: SpaceReqCtx;
  sendToClient: (m: ToClient) => Eff;
  broadcast: (m: ToClient) => Eff;
  msg: ToServer;
  model: Model;
}): {
  eff?: Eff<Msg>;
  model: Model;
} => {
  const handled = handle({ ctx, model, msg });
  const res: Res = { ...msg, result: handled };
  const modelNew: Model = handled.t === "ok" ? handled.value : model;
  return {
    model: modelNew,
    eff: broadcast(res),
  };
};

export const updateFromEvent = ({
  broadcast,
  msg,
  model,
}: {
  msg: SpaceEvent;
  model: Model;
  broadcast: (m: ToClient) => Eff;
}): {
  model: Model;
  eff?: Eff<Msg>;
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
      eff: broadcast({ t: "player-left", result: Ok(modelNew) }),
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
