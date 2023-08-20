import { Eff, p, Sub } from "gamezilla/@SHARED/core";
import {
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/app/space/@SHARED";
import { Chess } from "../@SHARED/chess";
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
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "bot-moved") {
    const result = botMoved(msg.moved, model);

    const modelNew = result.t === "err" ? model : result.value;

    return {
      model: modelNew,
      cmd: [{ t: "send-to-space", msg: { t: "bot-moved", result } }],
    };
  }

  return { model };
};

export const updateFromClient = (input: {
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  const updated = updateFromClientMain(input);

  return {
    ...updated,
    eff: Eff.batch([updated.eff, toBotMoveEff(input.model, updated.model)]),
  };
};

const toBotMoveEff = (modelPrev: Model, modelNext: Model): Eff<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext);

  if (!didChangeToBotTurn) {
    return Eff.None;
  }
  if (modelNext.type !== "game") {
    return Eff.None;
  }

  const eff = p(
    Chess.getBestMove(modelNext.botLevel, modelNext.board),
    Eff.perform((moved): Msg => ({ t: "bot-moved", moved }))
  );

  return eff;
};

const updateFromClientMain: typeof updateFromClient = ({ ctx, msg, model }) => {
  const handled = updateCore({ msg, model, ctx });

  const modelNew: Model = handled.t === "err" ? model : handled.value;

  return {
    model: modelNew,
    cmd: [{ t: "send-to-space", msg: { ...msg, result: handled } }],
  };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
  eff?: Eff;
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
        cmd: [
          { t: "send-to-space", msg: { t: "player-left", model: modelNew } },
        ],
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
