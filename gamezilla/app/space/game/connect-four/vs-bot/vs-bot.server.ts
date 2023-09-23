import { andThen, chain, Eff, p, Result, Sub } from "gamezilla/@SHARED/core";
import {
  sendToSpace,
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/app/space/@SHARED";
import { findBestMove } from "../connect-four";
import {
  Evt,
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
import { sendToClient } from "gamezilla/app/@SHARED/server";

export const init = initCore;

export const update = ({
  msg,
  model,
}: {
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  switch (msg.t) {
    case "bot-moved": {
      const updated = updateCoreEvent({
        msg: msg,
        model,
      });

      if (updated.t === "err") {
        return { model, cmd: [sendToSpace(msg)] };
      }

      return { model: updated.value, cmd: [sendToSpace(msg)] };
    }
  }
};

export const updateFromClient = (input: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return chain(
    input.model,
    (model) => updateFromClientMain({ ...input, model }),
    (model) => watchBotMove({ model, modelPrev: input.model })
  );
};

const watchBotMove = ({
  model,
  modelPrev,
}: {
  model: ServerModel;
  modelPrev: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
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

  const res: Res = { ...msg, result };

  if (result.t === "err") {
    return { model, cmd: [sendToClient([ctx.clientId], res)] };
  }

  return { model: result.value, cmd: [{ t: "send-to-space", msg: res }] };
};

export const updateFromEvt = ({
  msg,
  model,
}: {
  msg: SpaceEvt;
  model: ServerModel;
}): {
  model: ServerModel;
  cmd?: SpaceServerCmd<ToClient>[];
  eff?: Eff<ServerMsg>;
} => {
  if (msg.t === "user-left") {
    const event: Evt = {
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

export const subscriptions = (_model: ServerModel): Sub<ServerMsg> => {
  return Sub.None;
};
