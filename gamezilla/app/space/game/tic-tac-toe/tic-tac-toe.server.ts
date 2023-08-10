import { Cmd, Result, Sub } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@";
import { SpaceMsg, GameSpaceReqCtx } from "gamezilla/app/space/@";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./tic-tac-toe.core";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.server";

const { Err, Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = { t: "none" };

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (msg: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update(
      { broadcast: (c) => broadcast({ t: "vs-user", c }) },
      msg.c,
      model.c
    );
    return {
      model: { t: "vs-user", c: updated[0] },
      cmd: Cmd.t("vs-user", updated[1]),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      model: model.c,
      msg: msg.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  sendToClient: (msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  ctx: GameSpaceReqCtx;
  msg: ToServer;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (msg.t === "input-mode") {
    if (ctx.currentUserId !== ctx.hostId) {
      return {
        model,
        cmd: sendToClient({ ...msg, result: Err("must-be-host") }),
      };
    }

    const modelNew: ServerModel = initMode({
      mode: msg.mode,
      userId: ctx.hostId,
    });

    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Ok(modelNew) }),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromClient(
      {
        sendToClient: (c) => sendToClient({ t: "vs-user", c }),
        broadcast: (c) => broadcast({ t: "vs-user", c }),
      },
      msg.c,
      model.c
    );

    return {
      model: { ...model, c: updated[0] },
      cmd: Cmd.t("vs-user", updated[1]),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      sendToClient: (c) => sendToClient({ t: "vs-bot", c }),
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
      ctx,
    });

    return {
      model: { ...model, c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromParent = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Cmd;
  model: Model;
  msg: SpaceMsg;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === "none") {
    return { model };
  }

  if (model.t === "vs-bot") {
    const updated = VsBot.updateFromParent({
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      msg,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: updated.cmd ? Cmd.t("vs-bot", updated.cmd) : undefined,
    };
  }

  if (model.t === "vs-user") {
    const updated = VsUser.updateFromParent({
      broadcast: (c) => broadcast({ t: "vs-user", c }),
      msg,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: updated.cmd ? Cmd.t("vs-user", updated.cmd) : undefined,
    };
  }

  return { model };
};

const initMode = ({
  mode,
  userId,
}: {
  mode: ServerModel["t"];
  userId: UserId;
}): ServerModel => {
  if (mode === "none") {
    return { t: "none" };
  }

  if (mode === "vs-user") {
    return {
      t: "vs-user",
      c: VsUser.init({ X: userId, O: "none" }),
    };
  }

  if (mode === "vs-bot") {
    return {
      t: "vs-bot",
      c: VsBot.init({ userId }),
    };
  }

  return { t: "none" };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  if (model.t === "vs-user") {
    return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
  }

  if (model.t === "vs-bot") {
    return Sub.tag("vs-bot", VsBot.subscriptions(model.c));
  }

  return Sub.None;
};
