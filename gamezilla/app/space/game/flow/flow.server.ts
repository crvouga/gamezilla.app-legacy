import { err, ok, Sub } from "gamezilla/@SHARED/core";
import { GameServer, sendToSpace } from "gamezilla/app/space/@SHARED";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./flow.core";
import { PlayServer } from "./play";
import { PuzzleBuilderServer } from "./puzzle-builder";

type Server = GameServer<ServerModel, ServerMsg, ToClient, ToServer>;

const Play = GameServer.tag("play", PlayServer);
const PuzzleBuilder = GameServer.tag("puzzle-builder", PuzzleBuilderServer);

export const init: Server["init"] = () => {
  return { model: { t: "none" } };
};

export const update: Server["update"] = ({ msg, model, ...input }) => {
  switch (msg.t) {
    case "play": {
      if (model.t === "play") {
        return Play.update({ ...input, model, msg });
      }
      return { model };
    }

    case "puzzle-builder": {
      if (model.t === "puzzle-builder") {
        return PuzzleBuilder.update({ ...input, model, msg });
      }
      return { model };
    }
  }
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { msg, model, ctx } = input;

  switch (msg.t) {
    case "input-mode": {
      if (ctx.hostId !== ctx.currentUserId) {
        return {
          model,
          cmd: [sendToSpace({ ...msg, result: err("Must be the host") })],
        };
      }

      const initial = initMode(msg.mode)({ ...input, model: { t: "none" } });

      return {
        ...initial,
        cmd: [sendToSpace({ ...msg, result: ok(initial.model) })],
      };
    }

    case "play": {
      if (model.t === "play") {
        return Play.updateFromClient({ ...input, model, msg });
      }
      return { model };
    }

    case "puzzle-builder": {
      if (model.t === "puzzle-builder") {
        return PuzzleBuilder.updateFromClient({ ...input, model, msg });
      }
      return { model };
    }
  }
};

const initMode =
  (mode: ServerModel["t"]): Server["updateFromClient"] =>
  (input) => {
    switch (mode) {
      case "none": {
        return { model: { t: "none" } };
      }

      case "puzzle-builder": {
        return PuzzleBuilder.init(input);
      }

      case "play": {
        return Play.init(input);
      }
    }
  };

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
  return input;
};

export const subscriptions: Server["subscriptions"] = () => {
  return Sub.None;
};
