import { andThen, Eff, p, Result, Sub } from "gamezilla/@SHARED/core";
import {
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/app/space/@SHARED";
import { findBestMove } from "../connect-four";
import {
  Event,
  initCore,
  isBotTurn,
  Res,
  ServerModel,
  ServerMsg,
  toBotPlayer,
  ToClient,
  ToServer,
  updateCore,
  updateCoreEvent,
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
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "bot-moved") {
    const updated = updateCoreEvent({
      msg: msg,
      model,
    });

    if (updated.t === "err") {
      return { model, cmd: [{ t: "send-to-space", msg }] };
    }

    return { model: updated.value, cmd: [{ t: "send-to-space", msg }] };
  }

  return { model };
};

export const updateFromClient = (input: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return p(
    input,
    andThen((model) => updateFromClientMain({ ...input, model })),
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
  if (!isBotTurn(modelPrev) && isBotTurn(model) && model.type === "game") {
    const columns = model.columns;
    const botPlayer = toBotPlayer(model);
    return {
      model,
      eff: async (dispatch) => {
        const moved = findBestMove({
          columns,
          maximizingPlayer: botPlayer,
          maxDepth: 4,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch({ t: "bot-moved", moved });
      },
    };
  }

  return {
    model,
  };
};

const updateFromClientMain: typeof updateFromClient = ({ ctx, msg, model }) => {
  const result = updateCore({ ctx, msg, model });

  const res: Res = {
    ...msg,
    result: Result.mapOk(result, () => null),
  };

  if (result.t === "err") {
    return {
      model,
      cmd: [{ t: "send-to-client", clientIds: [ctx.clientId], msg: res }],
    };
  }

  return { model: result.value, cmd: [{ t: "send-to-space", msg: res }] };
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
  eff?: Eff<Msg>;
} => {
  if (msg.t === "user-left") {
    const event: Event = {
      t: "player-left",
      userId: msg.userId,
    };
    const updated = updateCoreEvent({
      msg: event,
      model,
    });

    if (updated.t === "err") {
      return { model };
    }

    return {
      model: updated.value,
      cmd: [{ t: "send-to-space", msg: event }],
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
