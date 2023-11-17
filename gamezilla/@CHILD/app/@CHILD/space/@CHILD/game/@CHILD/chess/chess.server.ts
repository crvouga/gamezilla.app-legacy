import {
  GameServer,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import { Eff, err, ok, Sub } from "gamezilla/@SHARED/core";
import * as Puzzle from "./@CHILD/puzzle/puzzle.server";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.server";
import * as VsUser from "./@CHILD/vs-user/vs-user.server";
import { Res, ServerModel, ServerMsg, ToClient, ToServer } from "./chess.core";

//
//
//
//
//
//
//

type Server = GameServer<{
  GameEvent: null;
  GameState: null;
  ServerModel: ServerModel;
  ServerMsg: ServerMsg;
  ToClient: ToClient;
  ToServer: ToServer;
}>;

//
//
//
// Model
//
//
//

export const init: Server["init"] = async () => {
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

export const update: Server["update"] = async ({ ctx, msg, model }) => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-user": {
      if (msg.t === "vs-user") {
        const updated = VsUser.update(msg.c, model.c);

        return {
          model: { t: "vs-user", c: updated.model },
        };
      }

      return { model };
    }

    case "vs-bot": {
      if (msg.t === "vs-bot") {
        const updated = VsBot.update({
          msg: msg.c,
          model: model.c,
        });

        return {
          model: { t: "vs-bot", c: updated.model },
          eff: Eff.t("vs-bot", updated.eff),
        };
      }

      return { model };
    }

    case "puzzle": {
      if (msg.t !== "puzzle") {
        return { model };
      }

      const updated = Puzzle.update({
        model: model.c,
        msg: msg.c,
        ctx,
      });

      return {
        model: { t: "puzzle", c: updated.model },
        eff: Eff.t("puzzle", updated.eff),
        cmd: SpaceServerCmd.tag("puzzle", updated.cmd),
      };
    }
  }
};

export const updateFromClient: Server["updateFromClient"] = async ({
  msg,
  model,
  ctx,
}) => {
  switch (msg.t) {
    case "input-mode": {
      const { result, eff } = initMode({
        ctx,
        mode: msg.mode,
        userId: msg.userId,
      });

      if (result.t === "err") {
        return {
          model,
          eff,
          cmd: [sendBack(ctx, { ...msg, result })],
        };
      }

      return {
        model,
        cmd: [{ t: "send-to-space", msg: { ...msg, result } }],
      };
    }

    case "vs-bot": {
      if (model.t === "vs-bot") {
        const updated = VsBot.updateFromClient({
          ctx,
          msg: msg.c,
          model: model.c,
        });

        return {
          model: { t: "vs-bot", c: updated.model },
          eff: Eff.t("vs-bot", updated.eff),
        };
      }

      return { model };
    }

    case "vs-user": {
      if (model.t === "vs-user") {
        const updated = VsUser.updateFromClient(msg.c, model.c);

        return {
          model: { t: "vs-user", c: updated.model },
          eff: Eff.t("vs-user", updated.eff),
          cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
        };
      }

      return { model };
    }

    case "puzzle": {
      if (model.t !== "puzzle") {
        return { model };
      }

      const updated = Puzzle.updateFromClient({
        model: model.c,
        msg: msg.c,
        ctx,
      });

      return {
        model: { t: "puzzle", c: updated.model },
        eff: Eff.t("puzzle", updated.eff),
      };
    }
  }
};

export const updateFromEvent: Server["updateFromEvent"] = async ({
  msg,

  model,
}) => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-bot": {
      const updated = VsBot.updateFromEvent({
        msg,
        model: model.c,
      });
      return {
        model: { t: "vs-bot", c: updated.model },
        eff: Eff.t("vs-bot", updated.eff),
      };
    }

    case "vs-user": {
      const updated = VsUser.updateFromEvent({
        msg,
        model: model.c,
      });
      return {
        model: { t: "vs-user", c: updated.model },
        eff: Eff.t("vs-user", updated.eff),
        cmd: SpaceServerCmd.tag("vs-user", updated.cmd),
      };
    }

    case "puzzle": {
      const updated = Puzzle.updateFromEvent({
        model: model.c,
        msg,
      });

      return {
        model: { t: "puzzle", c: updated.model },
        eff: Eff.t("puzzle", updated.eff),
      };
    }
  }
};

export const updateFromGame: Server["updateFromGame"] = async ({
  msg,
  model,
}) => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "puzzle": {
      return { model };
    }

    case "vs-bot": {
      return { model };
    }

    case "vs-user": {
      return { model };
    }
  }
};

const initMode = ({
  mode,
  userId,

  ctx,
}: {
  ctx: SpaceReqCtx;

  mode: ServerModel["t"];
  userId: UserId;
}): {
  result: Res["result"];
  eff?: Eff<ServerMsg>;
} => {
  if (ctx.space.hostId !== userId) {
    return { result: err("must_be_the_host") };
  }

  switch (mode) {
    case "none": {
      const modelNew: ServerModel = { t: "none" };

      return { result: ok(modelNew) };
    }

    case "vs-bot": {
      const modelNew: ServerModel = {
        t: "vs-bot",
        c: VsBot.init({ userId: userId }),
      };

      return { result: ok(modelNew) };
    }

    case "vs-user": {
      const modelNew: ServerModel = {
        t: "vs-user",
        c: VsUser.init({ userId: userId }),
      };

      return { result: ok(modelNew) };
    }

    case "puzzle": {
      const initial = Puzzle.init({ ctx });

      const modelNew: ServerModel = { t: "puzzle", c: initial.model };

      return { result: ok(modelNew), eff: Eff.t("puzzle", initial.eff) };
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

export const subscriptions: Server["subscriptions"] = async ({
  intervalId,
  model,
}) => {
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
    }

    case "vs-bot": {
      return Sub.tag("vs-bot", VsBot.subscriptions(intervalId, model.c));
    }

    case "puzzle": {
      return Sub.tag("puzzle", Puzzle.subscriptions(intervalId, model.c));
    }
  }
};
