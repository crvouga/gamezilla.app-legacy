import { UserId } from "@gamezilla/shared/app";
import { SpaceMsg } from "@gamezilla/shared/client";
import { Cmd, Err, Result, Sub } from "@gamezilla/shared/core";
import { SpaceRequestCtx } from "@gamezilla/shared/server";
import {
  Mode,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
} from "./connect-four.shared";
import * as VsBot from "./vs-bot/vs-bot.server";
import * as VsUser from "./vs-user/vs-user.server";

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
  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({
      broadcast: (c) => broadcast({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.tag_("vs-user", updated.cmd),
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
  ctx: SpaceRequestCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    const { mode } = msg;

    if (ctx.currentUserId !== ctx.hostId) {
      return {
        model,
        cmd: sendToClient({ ...msg, result: Err("must_be_host") }),
      };
    }

    const modelNew = initMode(mode, ctx.currentUserId);

    return {
      model: modelNew,
      cmd: broadcast({ ...msg, result: Result.Ok(modelNew) }),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      ctx,
      sendToClient: (c) => sendToClient({ t: "vs-bot", c }),
      broadcast: (c) => broadcast({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromClient({
      sendToClient: (c) => sendToClient({ t: "vs-user", c }),
      broadcast: (c) => broadcast({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
      ctx,
    });

    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.tag_("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromSpace = ({
  broadcast,
  msg,
  model,
}: {
  msg: SpaceMsg;
  model: Model;
  broadcast: (m: ToClient) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-bot": {
      const updated = VsBot.updateFromSpace({
        msg,
        model: model.c,
        broadcast: (c) => broadcast({ t: "vs-bot", c }),
      });
      return {
        model: { t: "vs-bot", c: updated.model },
        cmd: Cmd.tag_("vs-bot", updated.cmd),
      };
    }

    case "vs-user": {
      const updated = VsUser.updateFromSpace({
        msg,
        model: model.c,
        broadcast: (c) => broadcast({ t: "vs-user", c }),
      });

      return {
        model: { t: "vs-user", c: updated.model },
        cmd: Cmd.tag_("vs-user", updated.cmd),
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
        c: VsUser.init({ players: { PlayerOne: userId, PlayerTwo: null } }),
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.None;
    }

    case "vs-user": {
      return Sub.tag_("vs-user", VsUser.subscriptions(intervalId, model.c));
    }
  }
};
