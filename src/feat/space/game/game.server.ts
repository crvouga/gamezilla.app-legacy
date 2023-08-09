import { Cmd, Sub } from "src/core";
import { ChessServer } from "src/feat/space/game/chess";
import { ConnectFourServer } from "src/feat/space/game/connect-four";
import { FlowServer } from "src/feat/space/game/flow";
import { TicTacToeServer } from "src/feat/space/game/tic-tac-toe";
import { GameServer } from "src/feat/space/shared";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./game.core";

type Server = GameServer<Model, Msg, ToClient, ToServer>;

const ConnectFour = GameServer.tag("connect-four", ConnectFourServer);
const Flow = GameServer.tag("flow", FlowServer);

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init =
  ({ gameName }: { gameName: Model["t"] }): Server["init"] =>
  (input) => {
    switch (gameName) {
      case "connect-four": {
        return ConnectFour.init(input);
      }

      case "tic-tac-toe": {
        return { model: { t: "tic-tac-toe", c: TicTacToeServer.init } };
      }

      case "chess": {
        return { model: { t: "chess", c: ChessServer.init } };
      }

      case "flow": {
        return Flow.init(input);
      }

      default: {
        const check: never = gameName;
        return check;
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

export const update: Server["update"] = (input) => {
  const { sendToSpace, msg, model, ctx } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.update({ ...input, msg, model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    const updated = TicTacToeServer.update({
      broadcast: (m) => sendToSpace({ t: "tic-tac-toe", c: m }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      cmd: Cmd.t("tic-tac-toe", updated.cmd ?? Cmd.None),
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const [child, cmd] = ChessServer.update({
      broadcast: (m) => sendToSpace({ t: "chess", c: m }),
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return { model: { t: "chess", c: child }, cmd: Cmd.t("chess", cmd) };
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.update({ ...input, msg, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { sendToClient, sendToSpace, ctx, msg, model } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.updateFromClient({ ...input, msg, model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    const updated = TicTacToeServer.updateFromClient({
      sendToClient: (msg) => sendToClient({ t: "tic-tac-toe", c: msg }),
      broadcast: (msg) => sendToSpace({ t: "tic-tac-toe", c: msg }),
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      cmd: Cmd.t("tic-tac-toe", updated.cmd ?? Cmd.None),
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const [child, cmd] = ChessServer.updateFromClient({
      sendToClient: (msg) => sendToClient({ t: "chess", c: msg }),
      broadcast: (msg) => sendToSpace({ t: "chess", c: msg }),
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return { model: { t: "chess", c: child }, cmd: Cmd.t("chess", cmd) };
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.updateFromClient({ ...input, model, msg });
  }

  return { model };
};

export const updateFromParent: Server["updateFromParent"] = (input) => {
  const { sendToSpace, msg, model } = input;

  switch (model.t) {
    case "chess": {
      const updated = ChessServer.updateFromParent({
        broadcast: (m) => sendToSpace({ t: "chess", c: m }),
        msg,
        model: model.c,
      });

      return {
        model: { t: "chess", c: updated.model },
        cmd: Cmd.t("chess", updated.cmd ?? Cmd.None),
      };
    }

    case "connect-four": {
      return ConnectFour.updateFromParent({ ...input, model });
    }

    case "tic-tac-toe": {
      const updated = TicTacToeServer.updateFromParent({
        broadcast: (msg) => sendToSpace({ t: "tic-tac-toe", c: msg }),
        msg,
        model: model.c,
      });
      return {
        model: { t: "tic-tac-toe", c: updated.model },
        cmd: Cmd.t("tic-tac-toe", updated.cmd ?? Cmd.None),
      };
    }

    case "flow": {
      return Flow.updateFromParent({ ...input, model });
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

export const subscriptions: Server["subscriptions"] = (input): Sub<Msg> => {
  const { model, intervalId } = input;
  switch (model.t) {
    case "connect-four": {
      return ConnectFour.subscriptions({ ...input, model });
    }

    case "tic-tac-toe": {
      return Sub.tag(
        "tic-tac-toe",
        TicTacToeServer.subscriptions(intervalId, model.c)
      );
    }

    case "chess": {
      return Sub.tag("chess", ChessServer.subscriptions(intervalId, model.c));
    }

    case "flow": {
      return Flow.subscriptions({ ...input, model });
    }
  }
};
