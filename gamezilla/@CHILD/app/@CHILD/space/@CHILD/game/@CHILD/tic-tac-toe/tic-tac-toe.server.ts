import {
  SpaceReqCtx,
  SpaceServerEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space-server-cmd";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { sendToClient } from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, Result, Sub } from "gamezilla/@SHARED/core";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.server";
import * as VsUser from "./@CHILD/vs-user/vs-user.server";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./tic-tac-toe.core";

const { err: Err, ok: Ok } = Result;

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
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update(msg.c, model.c);
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      model: model.c,
      msg: msg.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceReqCtx;
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "input-mode") {
    if (ctx.currentUserId !== ctx.space.hostId) {
      return {
        model,
        cmd: [
          sendToClient([ctx.clientId], { ...msg, result: Err("must-be-host") }),
        ],
      };
    }

    const modelNew: ServerModel = initMode({
      mode: msg.mode,
      userId: ctx.space.hostId,
    });

    return {
      model: modelNew,
      cmd: [
        {
          t: "send-to-space",
          msg: { t: "input-mode", mode: msg.mode, result: Ok(modelNew) },
        },
      ],
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromClient(ctx, msg.c, model.c);

    return {
      model: { ...model, c: updated.model },
      cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
    });

    return {
      model: { ...model, c: updated.model },
      eff: Eff.t("vs-bot", updated.eff),
      cmd: SpaceServerCmd.tag("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromEvt = ({
  msg,
  model,
}: {
  model: Model;
  msg: SpaceServerEvt;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (model.t === "none") {
    return { model };
  }

  if (model.t === "vs-bot") {
    const updated = VsBot.updateFromEvt({
      msg,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-bot", updated.cmd),
    };
  }

  if (model.t === "vs-user") {
    const updated = VsUser.updateFromEvt({
      msg,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
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
  switch (mode) {
    case "none": {
      return { t: "none" };
    }

    case "vs-user": {
      return {
        t: "vs-user",
        c: VsUser.init({ X: userId, O: "none" }),
      };
    }

    case "vs-bot": {
      return {
        t: "vs-bot",
        c: VsBot.init({ userId }),
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
    case "vs-bot": {
      return Sub.tag("vs-bot", VsBot.subscriptions(model.c));
    }
    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
    }
    case "none": {
      return Sub.None;
    }
  }
};
