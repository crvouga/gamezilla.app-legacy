import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
  isBotTurn,
  toBotPlayer,
} from "./vs-bot.core";
import * as ConnectFour from "../../@SHARED/connect-four/connect-four";
import { ConnectFourBotWorker } from "../../@SHARED/connect-four";
type Server = GameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  GameState,
  GameEvent
>;

export const init: Server["init"] = async () => {
  return {
    model: null,
  };
};

export const update: Server["update"] = (input) => {
  const { msg, model } = input;
  switch (msg.t) {
    case "bot-dropped-disc": {
      return {
        model,
        events: [msg],
      };
    }
  }
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  return input;
};

export const updateFromEvent: Server["updateFromEvent"] = (input) => {
  return input;
};

export const updateFromGame: Server["updateFromGame"] = (input) => {
  const { model, prev, next } = input;

  if ((!prev || !isBotTurn(prev)) && isBotTurn(next) && next.type === "game") {
    return {
      model,
      eff: async (dispatch) => {
        const found = await ConnectFourBotWorker.findBestMove({
          maximizingPlayer: toBotPlayer(next),
          columns: next.columns,
          maxDepth: 4,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (found.t === "err") {
          return;
        }

        const columnIndex = found.value.columnIndex;

        if (!ConnectFour.isColumnIndex(columnIndex)) {
          return;
        }

        dispatch({ t: "bot-dropped-disc", columnIndex });
      },
    };
  }

  return { model };
};

export const subscriptions: Server["subscriptions"] = (input) => {
  return Sub.None;
};
