import { chain, Eff, Sub } from "gamezilla/@SHARED/core";
import {
  sendToSpace,
  SpaceEvt,
  SpaceReqCtx,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import { findBestMove, isColumnIndex } from "../connect-four";
import {
  initCore,
  isBotTurn,
  ServerModel,
  ServerMsg,
  toBotPlayer,
  ToClient,
  ToServer,
  toState,
  withMeta,
  appendEvent,
} from "./vs-bot.core";

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
    case "bot-dropped-disc": {
      const eventNew = withMeta(msg);
      const modelNew: ServerModel = {
        ...model,
        events: [...(model.events ?? []), eventNew],
      };
      return {
        model: modelNew,
        cmd: [sendToSpace(eventNew)],
      };
    }
    default: {
      return { model };
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
    (model) => {
      switch (input.msg.t) {
        default: {
          const modelNew: ServerModel = {
            ...model,
            ...appendEvent(model, input.msg),
          };
          return {
            model: modelNew,
            cmd: [sendToSpace(input.msg)],
          };
        }
      }
    },
    (model) => watchBotMove({ ...input, model, modelPrev: input.model })
  );
};

const watchBotMove = ({
  model,
  modelPrev,
  ctx,
}: {
  ctx: SpaceServerCtx;
  model: ServerModel;
  modelPrev: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  const statePrev = toState(ctx, modelPrev);
  const stateNext = toState(ctx, model);
  if (
    !isBotTurn(statePrev) &&
    isBotTurn(stateNext) &&
    stateNext.type === "game"
  ) {
    const columns = stateNext.columns;
    const botPlayer = toBotPlayer(stateNext);
    return {
      model,
      eff: async (dispatch) => {
        const moved = findBestMove({
          columns,
          maximizingPlayer: botPlayer,
          maxDepth: 4,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (moved.t === "ok" && isColumnIndex(moved.value.columnIndex)) {
          dispatch({
            t: "bot-dropped-disc",
            columnIndex: moved.value.columnIndex,
          });
        }
      },
    };
  }

  return {
    model,
  };
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
    const event = withMeta({
      t: "user-left",
      userId: msg.userId,
    });

    const modelNew: ServerModel = {
      ...model,
      ...appendEvent(model, event),
    };

    return {
      model: modelNew,
      cmd: [sendToSpace(event)],
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
