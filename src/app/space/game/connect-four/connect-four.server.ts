import { Cmd, Err, Result, Sub } from "src/core";
import { UserId } from "src/app/@shared/app";
import { GameServer } from "src/app/space/@shared";
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

export const update: Server["update"] = ({ sendToSpace, msg, model }) => {
  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      broadcast: (c) => sendToSpace({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({
      broadcast: (c) => sendToSpace({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.t("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = ({
  sendToClient,
  sendToSpace,
  msg,
  model,
  ctx,
}) => {
  if (msg.t === "input-mode") {
    const { mode } = msg;

    if (ctx.currentUserId !== ctx.hostId) {
      return {
        model,
        cmd: sendToClient({
          t: "input-mode",
          mode: msg.mode,
          result: Err("must_be_host"),
        }),
      };
    }

    const modelNew = initMode(mode, ctx.currentUserId);

    return {
      model: modelNew,
      cmd: sendToSpace({ ...msg, result: Result.Ok(modelNew) }),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      ctx,
      sendToClient: (c) => sendToClient({ t: "vs-bot", c }),
      broadcast: (c) => sendToSpace({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromClient({
      sendToClient: (c) => sendToClient({ t: "vs-user", c }),
      broadcast: (c) => sendToSpace({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
      ctx,
    });

    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.t("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromParent: Server["updateFromParent"] = ({
  msg,
  model,
  sendToSpace,
}) => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-bot": {
      const updated = VsBot.updateFromParent({
        msg,
        model: model.c,
        broadcast: (c) => sendToSpace({ t: "vs-bot", c }),
      });
      return {
        model: { t: "vs-bot", c: updated.model },
        cmd: Cmd.t("vs-bot", updated.cmd),
      };
    }

    case "vs-user": {
      const updated = VsUser.updateFromParent({
        msg,
        model: model.c,
        broadcast: (c) => sendToSpace({ t: "vs-user", c }),
      });

      return {
        model: { t: "vs-user", c: updated.model },
        cmd: Cmd.t("vs-user", updated.cmd),
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

export const subscriptions: Server["subscriptions"] = ({
  intervalId,
  model,
}) => {
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
