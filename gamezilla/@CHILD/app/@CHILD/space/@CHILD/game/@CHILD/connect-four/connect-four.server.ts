import { Sub } from "gamezilla/@SHARED/core";
import { GameServer } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture";
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
  if (input.model) {
    return { model: input.model };
  }

  const { ctx, state } = input;

  switch (state.t) {
    case "none": {
      return { model: { t: null } };
    }

    case "vs-bot": {
      return VsBot.init({ ctx, state });
    }

    case "vs-user": {
      return VsUser.init({ ctx, state });
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
  return GameServer.chain(
    await init(input),

    async (model) => {
      const { state, msg, clientMsg, evt, gameEvent } = input;

      switch (state.t) {
        case "none": {
          return { model };
        }

        case "vs-bot": {
          return VsBot.update({
            ctx: input.ctx,
            msg: msg?.t === "vs-bot" ? msg : null,
            state,
            model: model?.t === "vs-bot" ? model : null,
            clientMsg: clientMsg?.t === "vs-bot" ? clientMsg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-bot" ? {...gameEvent, c: {...gameEvent, ...gameEvent.c}}: null,
          });
        }

        case "vs-user": {
          return VsUser.update({
            ctx: input.ctx,
            msg: msg?.t === "vs-user" ? msg : null,
            state,
            model: model?.t === "vs-user" ? model : null,
            clientMsg: clientMsg?.t === "vs-user" ? clientMsg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-user" ? {...gameEvent, c: {...gameEvent, ...gameEvent.c}}: null,
          });
        }
      }
    }
  );
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

  switch (state.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return VsBot.subscriptions({
        ...input,
        state,
        model: model?.t === "vs-bot" ? model : null,
      });
    }

    case "vs-user": {
      return VsUser.subscriptions({
        ...input,
        state,
        model: model?.t === "vs-user" ? model : null,
      });
    }
  }
};
