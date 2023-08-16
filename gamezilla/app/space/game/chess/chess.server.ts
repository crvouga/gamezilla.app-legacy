import { Eff, Err, Ok, Sub } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  SpaceEvent,
  SpaceReqCtx,
  SpaceServerCtx,
} from "gamezilla/app/space/@SHARED";
import { ChessGameMsg } from "./@SHARED/chess/chess-shared";
import { Res, ServerModel, ServerMsg, ToClient, ToServer } from "./chess.core";
import * as Puzzle from "./puzzle/puzzle.server";
import { VsBotServer } from "./vs-bot";
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
  ctx,
  msg,
  model,
}: {
  broadcast: (msg: ToClient) => Eff;
  msg: Msg;
  model: Model;
  ctx: SpaceServerCtx;
}): [Model, Eff<Msg>] => {
  switch (model.t) {
    case "none": {
      return [model, Eff.None];
    }

    case "vs-user": {
      if (msg.t === "vs-user") {
        const [child, eff] = VsUser.update(
          { broadcast: (msg) => broadcast({ t: "vs-user", c: msg }) },
          msg.c,
          model.c
        );

        return [{ t: "vs-user", c: child }, Eff.t("vs-user", eff)];
      }

      return [model, Eff.None];
    }

    case "vs-bot": {
      if (msg.t === "vs-bot") {
        const updated = VsBotServer.update({
          broadcast: (msg) => broadcast({ t: "vs-bot", c: msg }),
          msg: msg.c,
          model: model.c,
        });

        return [
          { t: "vs-bot", c: updated.model },
          Eff.t("vs-bot", updated.eff),
        ];
      }

      return [model, Eff.None];
    }

    case "puzzle": {
      if (msg.t !== "puzzle") {
        return [model, Eff.None];
      }

      const updated = Puzzle.update({
        model: model.c,
        msg: msg.c,
        broadcast: (m) => broadcast({ t: "puzzle", c: m }),
        ctx,
      });

      return [
        { t: "puzzle", c: updated.model },
        Eff.t("puzzle", updated.eff ?? Eff.None),
      ];
    }
  }
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: SpaceReqCtx;
  sendToClient: (msg: ToClient) => Eff;
  broadcast: (msg: ToClient) => Eff;
  msg: ToServer;
  model: Model;
}): [Model, Eff<Msg>] => {
  switch (msg.t) {
    case "input-mode": {
      const { result, eff } = initMode({
        ctx,
        broadcast,
        mode: msg.mode,
        userId: msg.userId,
      });

      if (result.t === "err") {
        return [model, Eff.batch([eff, sendToClient({ ...msg, result })])];
      }

      const updated = updateFromGame({
        msg: { t: "mode-changed", mode: result.value.t },
        model: result.value,
      });

      return [
        updated.model,
        Eff.batch([broadcast({ ...msg, result }), updated.eff, eff]),
      ];
    }

    case "vs-bot": {
      if (model.t === "vs-bot") {
        const updated = VsBotServer.updateFromClient({
          ctx,
          sendToClient: (msg) => sendToClient({ t: "vs-bot", c: msg }),
          broadcast: (msg) => broadcast({ t: "vs-bot", c: msg }),
          msg: msg.c,
          model: model.c,
        });

        return [
          { t: "vs-bot", c: updated.model },
          Eff.t("vs-bot", updated.eff),
        ];
      }

      return [model, Eff.None];
    }

    case "vs-user": {
      if (model.t === "vs-user") {
        const [child, eff] = VsUser.updateFromClient(
          {
            sendToClient: (msg) => sendToClient({ t: "vs-user", c: msg }),
            broadcast: (msg) => broadcast({ t: "vs-user", c: msg }),
          },
          msg.c,
          model.c
        );

        return [{ t: "vs-user", c: child }, Eff.t("vs-user", eff)];
      }

      return [model, Eff.None];
    }

    case "puzzle": {
      if (model.t !== "puzzle") {
        return [model, Eff.None];
      }

      const updated = Puzzle.updateFromClient({
        model: model.c,
        msg: msg.c,
        sendToClient: (m) => sendToClient({ t: "puzzle", c: m }),
        broadcast: (m) => broadcast({ t: "puzzle", c: m }),
        ctx,
      });

      return [
        { t: "puzzle", c: updated.model },
        Eff.t("puzzle", updated.eff ?? Eff.None),
      ];
    }
  }
};

export const updateFromEvent = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (msg: ToClient) => Eff;
  model: Model;
  msg: SpaceEvent;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "vs-bot": {
      const updated = VsBotServer.updateFromEvent({
        broadcast: (m) => broadcast({ t: "vs-bot", c: m }),
        msg,
        model: model.c,
      });
      return {
        model: { t: "vs-bot", c: updated.model },
        eff: Eff.t("vs-bot", updated.eff ?? Eff.None),
      };
    }

    case "vs-user": {
      const updated = VsUser.updateFromEvent({
        broadcast: (m) => broadcast({ t: "vs-user", c: m }),
        msg,
        model: model.c,
      });
      return {
        model: { t: "vs-user", c: updated.model },
        eff: Eff.t("vs-user", updated.eff ?? Eff.None),
      };
    }

    case "puzzle": {
      const updated = Puzzle.updateFromEvent({
        model: model.c,
        msg,
      });

      return {
        model: { t: "puzzle", c: updated.model },
        eff: Eff.t("puzzle", updated.eff ?? Eff.None),
      };
    }
  }
};

export const updateFromGame = ({
  msg,
  model,
}: {
  msg: ChessGameMsg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (model.t) {
    case "none": {
      return { model };
    }

    case "puzzle": {
      const updated = Puzzle.updateFromGame({
        model: model.c,
        msg,
      });

      return {
        model: { t: "puzzle", c: updated.model },
        eff: Eff.t("puzzle", updated.eff ?? Eff.None),
      };
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
  broadcast,
  ctx,
}: {
  ctx: SpaceReqCtx;
  broadcast: (m: ToClient) => Eff;
  mode: ServerModel["t"];
  userId: UserId;
}): { result: Res["result"]; eff?: Eff<Msg> } => {
  if (ctx.hostId !== userId) {
    return { result: Err("must_be_the_host") };
  }

  switch (mode) {
    case "none": {
      const modelNew: ServerModel = { t: "none" };

      return { result: Ok(modelNew) };
    }

    case "vs-bot": {
      const modelNew: ServerModel = {
        t: "vs-bot",
        c: VsBotServer.init({ userId: userId }),
      };

      return { result: Ok(modelNew) };
    }

    case "vs-user": {
      const modelNew: ServerModel = {
        t: "vs-user",
        c: VsUser.init({ userId: userId }),
      };

      return { result: Ok(modelNew) };
    }

    case "puzzle": {
      const initial = Puzzle.init({
        ctx,
        broadcast: (m) => broadcast({ t: "puzzle", c: m }),
      });

      const modelNew: ServerModel = { t: "puzzle", c: initial.model };

      return { result: Ok(modelNew), eff: Eff.t("puzzle", initial.eff) };
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

    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(intervalId, model.c));
    }

    case "vs-bot": {
      return Sub.tag("vs-bot", VsBotServer.subscriptions(intervalId, model.c));
    }

    case "puzzle": {
      return Sub.tag("puzzle", Puzzle.subscriptions(intervalId, model.c));
    }
  }
};
