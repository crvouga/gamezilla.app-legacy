import { Eff, err, ok, Result, Sub } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { GameServer, SpaceServerCmd } from "gamezilla/app/space/@SHARED";
import {
  Mode,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.server";

type Server = GameServer<Model, Msg, ToClient, ToServer>;

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Server["init"] = () => {
  return {
    model: { t: "none" },
  };
};

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update: Server["update"] = ({ msg, model }) => {
  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = ({
  msg,
  model,
  ctx,
}) => {
  if (msg.t === "input-mode") {
    const { mode } = msg;

    if (ctx.currentUserId !== ctx.hostId) {
      return {
        model,
        cmd: [
          {
            t: "send-to-client",
            clientIds: [ctx.clientId],
            msg: {
              t: "input-mode",
              mode: msg.mode,
              result: err("You must be the host to change the game mode"),
            },
          },
        ],
      };
    }

    const modelNew = initMode(mode, ctx.currentUserId);

    return {
      model: modelNew,
      cmd: [
        {
          t: "send-to-space",
          msg: { ...msg, result: ok(modelNew) },
        },
      ],
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      ctx,
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.t("vs-bot", updated.eff),
      cmd: SpaceServerCmd.tag("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
    });

    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.t("vs-user", updated.eff),
      cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromEvt: Server["updateFromEvt"] = ({ msg, model }) => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-bot": {
      const updated = VsBot.updateFromEvt({
        msg,
        model: model.c,
      });
      return {
        model: { t: "vs-bot", c: updated.model },
        eff: Eff.t("vs-bot", updated.eff),
      };
    }

    case "vs-user": {
      const updated = VsUser.updateFromEvt({
        msg,
        model: model.c,
      });

      return {
        model: { t: "vs-user", c: updated.model },
        eff: Eff.t("vs-user", updated.eff),
      };
    }
  }
};

const initMode = (mode: Mode, userId: UserId): Model => {
  switch (mode) {
    case "none": {
      return { t: "none" };
    }

    case "vs-bot": {
      return {
        t: "vs-bot",
        c: VsBot.init({ player: userId }),
      };
    }

    case "vs-user": {
      return {
        t: "vs-user",
        c: VsUser.init({
          players: { "player-one": userId, "player-two": null },
        }),
      };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = (intervalId, model) => {
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.None;
    }

    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
    }
  }
};
