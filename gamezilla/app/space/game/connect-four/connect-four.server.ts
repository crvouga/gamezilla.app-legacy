import { Eff, err, ok, Sub } from "gamezilla/@SHARED/core";
import {
  SpaceGameServer,
  SpaceServerCmd,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import {
  Evt,
  Mode,
  ServerModel,
  ServerMsg,
  State,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBotServer from "./vs-bot/vs-bot.server";
import * as VsUserServer from "./vs-user/vs-user.server";

type Server = SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

const VsBot = SpaceGameServer.tag("vs-bot", VsBotServer);
const VsUser = SpaceGameServer.tag("vs-user", VsUserServer);

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

export const update: Server["update"] = (input) => {
  const { state, msg, model } = input;

  if (state.t === "vs-bot" && msg.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.update({ ...input, msg, state, model });
  }

  if (state.t === "vs-user" && msg.t === "vs-user" && model.t === "vs-user") {
    return VsUser.update({ ...input, msg, state, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { state, msg, model } = input;

  if (state.t === "vs-bot" && msg.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.updateFromClient({ ...input, msg, state, model });
  }

  if (state.t === "vs-user" && msg.t === "vs-user" && model.t === "vs-user") {
    return VsUser.updateFromClient({ ...input, msg, state, model });
  }

  return { model };
};

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
  const { state, model } = input;

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.updateFromEvt({ ...input, state, model });
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return VsUser.updateFromEvt({ ...input, state, model });
  }

  return { model };
};

export const updateFromGameEvt: Server["updateFromGameEvt"] = (input) => {
  const { before, after, model, msg } = input;

  if (
    after.t === "vs-bot" &&
    before.t === "vs-bot" &&
    model.t === "vs-bot" &&
    msg.t === "vs-bot"
  ) {
    return VsBot.updateFromGameEvt({ ...input, msg, before, after, model });
  }

  if (
    after.t === "vs-user" &&
    before.t === "vs-user" &&
    model.t === "vs-user" &&
    msg.t === "vs-user"
  ) {
    return VsUser.updateFromGameEvt({ ...input, before, after, model, msg });
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

export const subscriptions: Server["subscriptions"] = (input) => {
  const { state, model } = input;

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.subscriptions({ ...input, state, model });
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return VsUser.subscriptions({ ...input, state, model });
  }

  return Sub.None;
};
