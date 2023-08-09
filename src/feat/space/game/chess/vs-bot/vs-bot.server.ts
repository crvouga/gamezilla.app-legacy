import { Cmd, p, Sub } from "src/core";
import { SpaceMsg, GameSpaceReqCtx } from "src/feat/space/shared";
import * as Chess from "../chess/chess";
import {
  botMoved,
  updateCore,
  initServer,
  isBotTurn,
  ServerModel,
  ServerMsg,
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

export const init = initServer;

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
    const result = botMoved(msg.moved, model);

    const modelNew = result.t === "err" ? model : result.value;

    return {
      model: modelNew,
      cmd: broadcast({ t: "bot-moved", result }),
    };
  }

  return { model };
};

export const updateFromClient = (input: {
  sendToClient: (msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
  ctx: GameSpaceReqCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = updateFromClient_(input);

  return {
    ...updated,
    cmd: Cmd.batch([updated.cmd, toBotMoveCmd(input.model, updated.model)]),
  };
};

const toBotMoveCmd = (modelPrev: Model, modelNext: Model): Cmd<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext);

  if (!didChangeToBotTurn) {
    return Cmd.None;
  }
  if (modelNext.type !== "game") {
    return Cmd.None;
  }

  const cmd = p(
    Chess.getBestMove(modelNext.botLevel, modelNext.board),
    Cmd.perform((moved): Msg => ({ t: "bot-moved", moved }))
  );

  return cmd;
};

const updateFromClient_: typeof updateFromClient = ({
  broadcast,
  ctx,
  msg,
  model,
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const handled = updateCore({ msg, model, ctx });

  const modelNew: Model = handled.t === "err" ? model : handled.value;

  return { model: modelNew, cmd: broadcast({ ...msg, result: handled }) };
};

export const updateFromParent = ({
  msg,
  model,
  broadcast,
}: {
  msg: SpaceMsg;
  broadcast: (m: ToClient) => Cmd;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd;
} => {
  if (msg.t === "user-left") {
    if (model.userId === msg.userId) {
      const modelNew: Model = {
        type: "setup",
        botLevel: model.botLevel,
        userColor: model.userColor,
        userId: null,
      };
      return {
        model: modelNew,
        cmd: broadcast({ t: "player-left", model: modelNew }),
      };
    }
    return { model };
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

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.None;
};
