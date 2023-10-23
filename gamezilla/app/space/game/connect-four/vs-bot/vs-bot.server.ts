import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/app/space/@SHARED";
import {
  Event,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
  isBotTurn,
} from "./vs-bot.core";
import * as ConnectFour from "../@SHARED/connect-four/connect-four";

type Server = GameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Event
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
  const { model, before, after } = input;

  if ((!before || !isBotTurn(before)) && isBotTurn(after)) {
    return {
      model,
      eff: async (dispatch) => {
        const columnIndex =
          ConnectFour.ALL_COLUMN_INDEXES[
            Math.floor(Math.random() * ConnectFour.ALL_COLUMN_INDEXES.length)
          ];

        if (columnIndex) {
          dispatch({ t: "bot-dropped-disc", columnIndex });
        }
      },
    };
  }

  return { model };
};

export const subscriptions: Server["subscriptions"] = (input) => {
  return Sub.None;
};
