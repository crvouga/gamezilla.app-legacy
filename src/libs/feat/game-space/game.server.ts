import { Cmd, Sub, exhaustive } from "@gamezilla/core";
import { ChessServer } from "@gamezilla/game/chess";
import { ConnectFourServer } from "@gamezilla/game/connect-four";
import { FlowServer } from "@gamezilla/game/flow";
import { GomokuServer } from "@gamezilla/game/gomoku";
import { MazeServer } from "@gamezilla/game/maze";
import { SnakeServer } from "@gamezilla/game/snake";
import { TetrisServer } from "@gamezilla/game/tetris";
import { TicTacToeServer } from "@gamezilla/game/tic-tac-toe";
import { UserId } from "@gamezilla/shared/app";
import {
  GameSpaceMsg,
  GameSpaceReqCtx,
  GameSpaceServerCtx,
} from "@gamezilla/shared/game-space";
import { ServerModel, ServerMsg, ToClient, ToServer } from "./game.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = ({
  gameName,
  ctx,
}: {
  ctx: { currentUserId: UserId };
  gameName: Model["t"];
}): Model => {
  switch (gameName) {
    case "connect-four": {
      return { t: "connect-four", c: ConnectFourServer.init };
    }

    case "tic-tac-toe": {
      return { t: "tic-tac-toe", c: TicTacToeServer.init };
    }

    case "chess": {
      return { t: "chess", c: ChessServer.init };
    }

    case "gomoku": {
      return { t: "gomoku", c: GomokuServer.init };
    }

    case "tetris": {
      return { t: "tetris", c: TetrisServer.init };
    }

    case "snake": {
      return { t: "snake", c: SnakeServer.init };
    }

    case "maze": {
      return {
        t: "maze",
        c: MazeServer.init({
          userId: ctx.currentUserId,
        }),
      };
    }

    case "flow": {
      return { t: "flow", c: FlowServer.init };
    }

    default: {
      return exhaustive(gameName);
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

export const update = ({
  broadcast,
  msg,
  model,
  ctx,
}: {
  ctx: GameSpaceServerCtx;
  broadcast: (m: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case "connect-four": {
      if (model.t === "connect-four") {
        const updated = ConnectFourServer.update({
          broadcast: (m) => broadcast({ t: "connect-four", c: m }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "connect-four", c: updated.model },
          Cmd.tag_("connect-four", updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case "tic-tac-toe": {
      if (model.t === "tic-tac-toe") {
        const updated = TicTacToeServer.update({
          broadcast: (m) => broadcast({ t: "tic-tac-toe", c: m }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "tic-tac-toe", c: updated.model },
          Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
    }

    case "chess": {
      if (model.t === "chess") {
        const [child, cmd] = ChessServer.update({
          broadcast: (m) => broadcast({ t: "chess", c: m }),
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [{ t: "chess", c: child }, Cmd.tag_("chess", cmd)];
      }
      return [model, Cmd.None];
    }

    case "gomoku": {
      if (model.t === "gomoku") {
        const updated = GomokuServer.update({
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "gomoku", c: updated.model },
          Cmd.tag_("gomoku", updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case "tetris": {
      if (model.t === "tetris") {
        const [child, cmd] = TetrisServer.update(
          {
            broadcast: (m) => broadcast({ t: "tetris", c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: "tetris", c: child }, Cmd.tag_("tetris", cmd)];
      }
      return [model, Cmd.None];
    }

    case "snake": {
      if (model.t === "snake") {
        const [child, cmd] = SnakeServer.update(
          {
            broadcast: (m) => broadcast({ t: "snake", c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: "snake", c: child }, Cmd.tag_("snake", cmd)];
      }
      return [model, Cmd.None];
    }

    case "maze": {
      if (model.t === "maze") {
        const [child, cmd] = MazeServer.update(
          {
            broadcast: (m) => broadcast({ t: "maze", c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: "maze", c: child }, Cmd.tag_("maze", cmd)];
      }
      return [model, Cmd.None];
    }

    case "flow": {
      if (model.t !== "flow") {
        return [model, Cmd.None];
      }
      const updated = FlowServer.update({
        model: model.c,
        msg: msg.c,
      });
      return [
        { t: "flow", c: updated.model },
        Cmd.tag_("flow", updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  ctx,
  msg,
  model,
}: {
  ctx: GameSpaceReqCtx;
  sendToClient: (msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case "connect-four": {
      if (model.t === "connect-four") {
        const updated = ConnectFourServer.updateFromClient({
          ctx,
          sendToClient: (msg) => sendToClient({ t: "connect-four", c: msg }),
          broadcast: (msg) => broadcast({ t: "connect-four", c: msg }),
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "connect-four", c: updated.model },
          Cmd.tag_("connect-four", updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case "tic-tac-toe": {
      if (model.t === "tic-tac-toe") {
        const updated = TicTacToeServer.updateFromClient({
          sendToClient: (msg) => sendToClient({ t: "tic-tac-toe", c: msg }),
          broadcast: (msg) => broadcast({ t: "tic-tac-toe", c: msg }),
          msg: msg.c,
          model: model.c,
          ctx,
        });
        return [
          { t: "tic-tac-toe", c: updated.model },
          Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
    }

    case "chess": {
      if (model.t === "chess") {
        const [child, cmd] = ChessServer.updateFromClient({
          sendToClient: (msg) => sendToClient({ t: "chess", c: msg }),
          broadcast: (msg) => broadcast({ t: "chess", c: msg }),
          msg: msg.c,
          model: model.c,
          ctx,
        });
        return [{ t: "chess", c: child }, Cmd.tag_("chess", cmd)];
      }
      return [model, Cmd.None];
    }

    case "gomoku": {
      if (model.t === "gomoku") {
        const updated = GomokuServer.updateFromClient({
          ctx,
          broadcast: (m) => broadcast({ t: "gomoku", c: m }),
          sendToClient: (m) => sendToClient({ t: "gomoku", c: m }),
          msg: msg.c,
          model: model.c,
        });

        return [
          { t: "gomoku", c: updated.model },
          Cmd.tag_("gomoku", updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case "tetris": {
      if (model.t === "tetris") {
        const [child, cmd] = TetrisServer.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: "tetris", c: m }),
            sendToClient: (m) => sendToClient({ t: "tetris", c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: "tetris", c: child }, Cmd.tag_("tetris", cmd)];
      }
      return [model, Cmd.None];
    }

    case "snake": {
      if (model.t === "snake") {
        const [child, cmd] = SnakeServer.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: "snake", c: m }),
            sendToClient: (m) => sendToClient({ t: "snake", c: m }),
          },
          msg.c,
          model.c
        );
        return [{ t: "snake", c: child }, Cmd.tag_("snake", cmd)];
      }
      return [model, Cmd.None];
    }

    case "maze": {
      if (model.t === "maze") {
        const [child, cmd] = MazeServer.updateFromClient(
          {
            // ctx,
            broadcast: (m) => broadcast({ t: "maze", c: m }),
            // sendToClient: (m) => sendToClient(['maze', m]),
          },
          msg.c,
          model.c
        );
        return [{ t: "maze", c: child }, Cmd.tag_("maze", cmd)];
      }
      return [model, Cmd.None];
    }

    case "flow": {
      if (model.t !== "flow") {
        return [model, Cmd.None];
      }
      const updated = FlowServer.updateFromClient({
        model: model.c,
        msg: msg.c,
        ctx,
        broadcast: (m) => broadcast({ t: "flow", c: m }),
      });
      return [
        { t: "flow", c: updated.model },
        Cmd.tag_("flow", updated?.cmd ?? Cmd.None),
      ];
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromSpace = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Cmd;
  msg: GameSpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (model.t) {
    case "chess": {
      const updated = ChessServer.updateFromSpace({
        broadcast: (m) => broadcast({ t: "chess", c: m }),
        msg,
        model: model.c,
      });

      return {
        model: { t: "chess", c: updated.model },
        cmd: Cmd.tag_("chess", updated.cmd ?? Cmd.None),
      };
    }

    case "connect-four": {
      const updated = ConnectFourServer.updateFromSpace({
        msg,
        model: model.c,
        broadcast: (m) => broadcast({ t: "connect-four", c: m }),
      });
      return {
        model: { t: "connect-four", c: updated.model },
        cmd: Cmd.tag_("connect-four", updated.cmd ?? Cmd.None),
      };
    }

    case "tic-tac-toe": {
      const updated = TicTacToeServer.updateFromSpace({
        broadcast: (msg) => broadcast({ t: "tic-tac-toe", c: msg }),
        msg,
        model: model.c,
      });
      return {
        model: { t: "tic-tac-toe", c: updated.model },
        cmd: Cmd.tag_("tic-tac-toe", updated.cmd ?? Cmd.None),
      };
    }

    case "gomoku": {
      const updated = GomokuServer.updateFromSpace({
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
      return { model };
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
    case "connect-four": {
      return Sub.tag_(
        "connect-four",
        ConnectFourServer.subscriptions(intervalId, model.c)
      );
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
      return Sub.tag_("flow", FlowServer.subscriptions(model.c));
    }
  }
};
