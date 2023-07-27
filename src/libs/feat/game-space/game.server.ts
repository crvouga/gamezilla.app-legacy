import { Cmd, Sub } from "@gamezilla/core";
import { ChessServer } from "@gamezilla/game/chess";
import { ConnectFourServer } from "@gamezilla/game/connect-four";
import { FlowServer } from "@gamezilla/game/flow";
import { GomokuServer } from "@gamezilla/game/gomoku";
import { MazeServer } from "@gamezilla/game/maze";
import { SnakeServer } from "@gamezilla/game/snake";
import { TetrisServer } from "@gamezilla/game/tetris";
import { TicTacToeServer } from "@gamezilla/game/tic-tac-toe";
import { GameServer } from "@gamezilla/shared/game-space";
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

      case "gomoku": {
        return { model: { t: "gomoku", c: GomokuServer.init } };
      }

      case "tetris": {
        return { model: { t: "tetris", c: TetrisServer.init } };
      }

      case "snake": {
        return { model: { t: "snake", c: SnakeServer.init } };
      }

      case "maze": {
        return {
          model: { t: "maze", c: MazeServer.init({}) },
        };
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
      cmd: Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const [child, cmd] = ChessServer.update({
      broadcast: (m) => sendToSpace({ t: "chess", c: m }),
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return { model: { t: "chess", c: child }, cmd: Cmd.tag_("chess", cmd) };
  }

  if (model.t === "gomoku" && msg.t === "gomoku") {
    const updated = GomokuServer.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "gomoku", c: updated.model },
      cmd: Cmd.tag_("gomoku", updated.cmd),
    };
  }

  if (model.t === "tetris" && msg.t === "tetris") {
    const [child, cmd] = TetrisServer.update(
      {
        broadcast: (m) => sendToSpace({ t: "tetris", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "tetris", c: child }, cmd: Cmd.tag_("tetris", cmd) };
  }

  if (model.t === "snake" && msg.t === "snake") {
    const [child, cmd] = SnakeServer.update(
      {
        broadcast: (m) => sendToSpace({ t: "snake", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "snake", c: child }, cmd: Cmd.tag_("snake", cmd) };
  }
  if (model.t === "maze" && msg.t === "maze") {
    const [child, cmd] = MazeServer.update(
      {
        broadcast: (m) => sendToSpace({ t: "maze", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "maze", c: child }, cmd: Cmd.tag_("maze", cmd) };
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
      cmd: Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
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
    return { model: { t: "chess", c: child }, cmd: Cmd.tag_("chess", cmd) };
  }

  if (model.t === "gomoku" && msg.t === "gomoku") {
    const updated = GomokuServer.updateFromClient({
      ctx,
      broadcast: (m) => sendToSpace({ t: "gomoku", c: m }),
      sendToClient: (m) => sendToClient({ t: "gomoku", c: m }),
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "gomoku", c: updated.model },
      cmd: Cmd.tag_("gomoku", updated.cmd),
    };
  }

  if (model.t === "tetris" && msg.t === "tetris") {
    const [child, cmd] = TetrisServer.updateFromClient(
      {
        // ctx,
        broadcast: (m) => sendToSpace({ t: "tetris", c: m }),
        sendToClient: (m) => sendToClient({ t: "tetris", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "tetris", c: child }, cmd: Cmd.tag_("tetris", cmd) };
  }

  if (model.t === "snake" && msg.t === "snake") {
    const [child, cmd] = SnakeServer.updateFromClient(
      {
        // ctx,
        broadcast: (m) => sendToSpace({ t: "snake", c: m }),
        sendToClient: (m) => sendToClient({ t: "snake", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "snake", c: child }, cmd: Cmd.tag_("snake", cmd) };
  }

  if (model.t === "maze" && msg.t === "maze") {
    const [child, cmd] = MazeServer.updateFromClient(
      {
        broadcast: (m) => sendToSpace({ t: "maze", c: m }),
      },
      msg.c,
      model.c
    );
    return { model: { t: "maze", c: child }, cmd: Cmd.tag_("maze", cmd) };
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.updateFromClient({ ...input, model, msg });
  }

  return { model };
};

export const updateFromGameSpace: Server["updateFromGameSpace"] = (input) => {
  const { sendToSpace, msg, model } = input;

  switch (model.t) {
    case "chess": {
      const updated = ChessServer.updateFromGameSpace({
        broadcast: (m) => sendToSpace({ t: "chess", c: m }),
        msg,
        model: model.c,
      });

      return {
        model: { t: "chess", c: updated.model },
        cmd: Cmd.tag_("chess", updated.cmd ?? Cmd.None),
      };
    }

    case "connect-four": {
      return ConnectFour.updateFromGameSpace({ ...input, model });
    }

    case "tic-tac-toe": {
      const updated = TicTacToeServer.updateFromGameSpace({
        broadcast: (msg) => sendToSpace({ t: "tic-tac-toe", c: msg }),
        msg,
        model: model.c,
      });
      return {
        model: { t: "tic-tac-toe", c: updated.model },
        cmd: Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
      };
    }

    case "gomoku": {
      const updated = GomokuServer.updateFromGameSpace({
        msg,
        model: model.c,
      });
      return {
        model: { t: "gomoku", c: updated.model },
        cmd: Cmd.tag_("gomoku", updated.cmd ?? Cmd.None),
      };
    }

    case "tetris": {
      return { model };
    }

    case "snake": {
      return { model };
    }

    case "maze": {
      return { model };
    }

    case "flow": {
      return Flow.updateFromGameSpace({ ...input, model });
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
      return Sub.tag_(
        "tic-tac-toe",
        TicTacToeServer.subscriptions(intervalId, model.c)
      );
    }

    case "chess": {
      return Sub.tag_("chess", ChessServer.subscriptions(intervalId, model.c));
    }

    case "gomoku": {
      return Sub.tag_("gomoku", GomokuServer.subscriptions(model.c));
    }

    case "tetris": {
      return Sub.tag_(
        "tetris",
        TetrisServer.subscriptions(intervalId, model.c)
      );
    }

    case "snake": {
      return Sub.tag_("snake", SnakeServer.subscriptions(intervalId, model.c));
    }

    case "maze": {
      return Sub.tag_("maze", MazeServer.subscriptions(intervalId, model.c));
    }

    case "flow": {
      return Flow.subscriptions({ ...input, model });
    }
  }
};
