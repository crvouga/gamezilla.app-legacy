import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  GameEvent,
  ServerModel,
  ServerMsg,
  GameState,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBotServer from "./@CHILD/vs-bot/vs-bot.server";
import * as VsUserServer from "./@CHILD/vs-user/vs-user.server";

type Server = GameServer<{
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
}>;

const VsBot = GameServer.tag("vs-bot", VsBotServer);
const VsUser = GameServer.tag("vs-user", VsUserServer);

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
  const { state } = input;
  switch (state.t) {
    case "none": {
      return { model: { t: null } };
    }

    case "vs-bot": {
      return VsBot.init({ ...input, state });
    }

    case "vs-user": {
      return VsUser.init({ ...input, state });
    }
  }
};

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update: Server["update"] = async (input) => {
  const { state, msg, model } = input;

  if (state.t === "vs-bot" && msg.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.update({ ...input, msg, state, model });
  }

  if (state.t === "vs-user" && msg.t === "vs-user" && model.t === "vs-user") {
    return VsUser.update({ ...input, msg, state, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = async (input) => {
  const { state, msg, model } = input;

  if (state.t === "vs-bot" && msg.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.updateFromClient({ ...input, msg, state, model });
  }

  if (state.t === "vs-user" && msg.t === "vs-user" && model.t === "vs-user") {
    return VsUser.updateFromClient({ ...input, msg, state, model });
  }

  return { model };
};

export const updateFromEvent: Server["updateFromEvent"] = async (input) => {
  const { state, model } = input;

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.updateFromEvent({ ...input, state, model });
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return VsUser.updateFromEvent({ ...input, state, model });
  }

  return { model };
};

export const updateFromGame: Server["updateFromGame"] = async (input) => {
  const { prev, next, model, msg } = input;

  if (next.t === "vs-bot" && model.t === "vs-bot" && msg.t === "vs-bot") {
    return VsBot.updateFromGame({
      ...input,
      msg,
      model,
      next: next,
      prev: prev?.t === "vs-bot" ? prev : null,
    });
  }

  if (next.t === "vs-user" && model.t === "vs-user" && msg.t === "vs-user") {
    return VsUser.updateFromGame({
      ...input,
      prev: prev?.t === "vs-user" ? prev : null,
      next: next,
      model,
      msg,
    });
  }

  return input;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (input) => {
  const { state, model } = input;

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.subscriptions({ ...input, state, model });
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return VsUser.subscriptions({ ...input, state, model });
  }

  return Sub.None;
};
