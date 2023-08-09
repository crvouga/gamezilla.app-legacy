import { Cmd, Result, Sub } from "src/core";
import { UserId } from "src/app/@/app";
import { SpaceMsg, GameSpaceReqCtx } from "src/app/space/@";
import {
  Mode,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./gomoku.core";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.server";

const { Ok } = Result;

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = {
  t: "none",
};

const initMode = ({ mode, userId }: { mode: Mode; userId: UserId }): Model => {
  switch (mode) {
    case "none": {
      return { t: "none" };
    }

    case "vs-bot": {
      return {
        t: "vs-bot",
        c: VsBot.init({ userId }),
      };
    }

    case "vs-user": {
      return {
        t: "vs-user",
        c: VsUser.init({ white: userId, black: null }),
      };
    }
  }
};

//
//
//
// update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({ msg: msg.c, model: model.c });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({ msg: msg.c, model: model.c });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.t("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromClient = ({
  ctx,
  broadcast,
  sendToClient,
  msg,
  model,
}: {
  ctx: GameSpaceReqCtx;
  sendToClient: (m: ToClient) => Cmd;
  broadcast: (m: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    const modelNew = initMode(msg);
    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Ok(modelNew) }),
    };
  }

  if (model.t === "vs-bot" && msg.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      ctx,
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      sendToClient: (c) => sendToClient({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
      broadcast: (c) => broadcast({ t: "vs-user", c }),
      sendToClient: (c) => sendToClient({ t: "vs-user", c }),
    });

    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.t("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromParent = ({
  msg,
  model,
}: {
  msg: SpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (model.t === "vs-bot") {
    const updated = VsBot.updateFromParent({ msg, model: model.c });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.t("vs-bot", updated.cmd),
    };
  }

  if (model.t === "vs-user") {
    const updated = VsUser.updateFromParent({ msg, model: model.c });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.t("vs-user", updated.cmd),
    };
  }

  return {
    model,
  };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
