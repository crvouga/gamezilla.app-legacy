import { Cmd, Sub, exhaustive } from "@gamezilla/core";
import { ChessClient } from "@gamezilla/game/chess";
import { ConnectFourClient } from "@gamezilla/game/connect-four";
import { FlowClient } from "@gamezilla/game/flow";
import { GomokuClient } from "@gamezilla/game/gomoku";
import { MazeClient } from "@gamezilla/game/maze";
import { SnakeClient } from "@gamezilla/game/snake";
import { TetrisClient } from "@gamezilla/game/tetris";
import { TicTacToeClient } from "@gamezilla/game/tic-tac-toe";
import { GameClient } from "@gamezilla/shared/game-space";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./game.core";

type Client = GameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

const ConnectFour = GameClient.tag("connect-four", ConnectFourClient);
const Flow = GameClient.tag("flow", FlowClient);

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init =
  ({ gameName }: { gameName: Model["t"] }): Client["init"] =>
  (input) => {
    switch (gameName) {
      case "tic-tac-toe": {
        return { model: { t: "tic-tac-toe", c: TicTacToeClient.init } };
      }

      case "connect-four": {
        return ConnectFour.init(input);
      }

      case "chess": {
        const initial = ChessClient.init();
        return {
          model: { t: "chess", c: initial.model },
          cmd: Cmd.tag_("chess", initial.cmd),
        };
      }

      case "gomoku": {
        return { model: { t: "gomoku", c: GomokuClient.init } };
      }

      case "tetris": {
        return { model: { t: "tetris", c: TetrisClient.init } };
      }

      case "snake": {
        return { model: { t: "snake", c: SnakeClient.init } };
      }

      case "maze": {
        return {
          model: {
            t: "maze",
            c: MazeClient.init({}),
          },
        };
      }

      case "flow": {
        return Flow.init(input);
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

export type Msg = ClientMsg;

export const update: Client["update"] = (input) => {
  const { ctx, sendToServer, msg, model } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.update({ ...input, msg: msg, model: model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    const updated = TicTacToeClient.update({
      sendToServer: (msg) => sendToServer({ t: "tic-tac-toe", c: msg }),
      ctx,
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "tic-tac-toe", c: updated.model },
      cmd: Cmd.tag_("tic-tac-toe", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const [child, cmd] = ChessClient.update({
      ctx,
      sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "chess", c: child },
      cmd: Cmd.tag_("chess", cmd),
    };
  }

  if (model.t === "gomoku" && msg.t === "gomoku") {
    const updated = GomokuClient.update({
      ctx,
      sendToServer: (msg) => sendToServer({ t: "gomoku", c: msg }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "gomoku", c: updated.model },
      cmd: Cmd.tag_("gomoku", updated.cmd),
    };
  }

  if (model.t === "tetris" && msg.t === "tetris") {
    const [child, cmd] = TetrisClient.update(
      { sendToServer: (msg) => sendToServer({ t: "tetris", c: msg }) },
      msg.c,
      model.c
    );
    return {
      model: { t: "tetris", c: child },
      cmd: Cmd.tag_("tetris", cmd),
    };
  }

  if (model.t === "snake" && msg.t === "snake") {
    const [child, cmd] = SnakeClient.update(
      {
        ctx,
        sendToServer: (msg) => sendToServer({ t: "snake", c: msg }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: "snake", c: child },
      cmd: Cmd.tag_("snake", cmd),
    };
  }

  if (model.t === "maze" && msg.t === "maze") {
    const [child, cmd] = MazeClient.update(
      { ctx, sendToServer: (msg) => sendToServer({ t: "maze", c: msg }) },
      msg.c,
      model.c
    );
    return {
      model: { t: "maze", c: child },
      cmd: Cmd.tag_("maze", cmd),
    };
  }

  if (model.t === "flow" && msg.t === "flow") {
    const updated = FlowClient.update({
      ctx,
      sendToServer: (c) => sendToServer({ t: "flow", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "flow", c: updated.model },
      cmd: Cmd.tag_("flow", updated?.cmd ?? Cmd.None),
    };
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, sendToServer, msg, model } = input;
  if (msg.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromServer({ ...input, msg, model });
  }

  if (msg.t === "gomoku" && model.t === "gomoku") {
    const updated = GomokuClient.updateFromServer({
      msg: msg.c,
      ctx,
      model: model.c,
    });

    return {
      model: { t: "gomoku", c: updated.model },
      cmd: Cmd.tag_("gomoku", updated.cmd),
    };
  }

  if (msg.t === "tic-tac-toe" && model.t === "tic-tac-toe") {
    const updated = TicTacToeClient.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      cmd: Cmd.tag_("tic-tac-toe", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (msg.t === "chess" && model.t === "chess") {
    const updated = ChessClient.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
    });

    return {
      model: { t: "chess", c: updated.model },
      cmd: Cmd.tag_("chess", updated.cmd),
      msgs: updated.msgs,
    };
  }

  if (msg.t === "tetris" && model.t === "tetris") {
    const [child, cmd] = TetrisClient.updateFromServer(msg.c, model.c);
    return {
      model: { t: "tetris", c: child },
      cmd: Cmd.tag_("tetris", cmd),
    };
  }

  if (msg.t === "snake" && model.t === "snake") {
    const [child, cmd] = SnakeClient.updateFromServer(
      // { ctx, sendToServer: (msg) => sendToServer(['snake', msg]) },
      msg.c,
      model.c
    );
    return {
      model: { t: "snake", c: child },
      cmd: Cmd.tag_("snake", cmd),
    };
  }

  if (msg.t === "maze" && model.t === "maze") {
    const [child, cmd] = MazeClient.updateFromServer(
      // { ctx, sendToServer: (msg) => sendToServer(['maze', msg]) },
      msg.c,
      model.c
    );
    return {
      model: { t: "maze", c: child },
      cmd: Cmd.tag_("maze", cmd),
    };
  }

  if (msg.t === "flow" && model.t === "flow") {
    return Flow.updateFromServer({ ...input, msg, model });
  }

  return { model };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (input): Sub<Msg> => {
  const { model, ctx, intervalId } = input;
  if (model.t === "connect-four") {
    return ConnectFour.subscriptions({ ...input, model });
  }

  if (model.t === "tic-tac-toe") {
    return Sub.tag_(
      "tic-tac-toe",
      TicTacToeClient.subscriptions({ model: model.c })
    );
  }

  if (model.t === "chess") {
    return Sub.tag_(
      "chess",
      ChessClient.subscriptions({
        now: ctx.now,
        intervalId,
        model: model.c,
      })
    );
  }

  if (model.t === "gomoku") {
    return Sub.tag_("gomoku", GomokuClient.subscriptions(ctx, model.c));
  }

  if (model.t === "tetris") {
    return Sub.tag_("tetris", TetrisClient.subscriptions(model.c));
  }

  if (model.t === "snake") {
    return Sub.tag_("snake", SnakeClient.subscriptions(intervalId, model.c));
  }

  if (model.t === "maze") {
    return Sub.tag_("maze", MazeClient.subscriptions(model.c));
  }

  if (model.t === "flow") {
    return Flow.subscriptions({ ...input, model });
  }

  const check: never = model;
  return check;
};

//
//
//
// View
//
//
//

export const View: Client["View"] = (input) => {
  const { ctx, model, dispatch } = input;
  switch (model.t) {
    case "connect-four": {
      return <ConnectFour.View {...input} model={model} />;
    }

    case "tic-tac-toe": {
      return (
        <TicTacToeClient.View
          ctx={ctx}
          model={model.c}
          dispatch={(c) => dispatch({ t: "tic-tac-toe", c })}
        />
      );
    }

    case "chess": {
      return (
        <ChessClient.View
          ctx={ctx}
          model={model.c}
          gameSpaceCtx={ctx}
          dispatch={(c) => dispatch({ t: "chess", c })}
        />
      );
    }

    case "gomoku": {
      return GomokuClient.view({
        dispatch: (c) => dispatch({ t: "gomoku", c }),
        model: model.c,
        ctx,
        gameSpaceCtx: ctx,
      });
    }

    case "tetris": {
      return (
        <TetrisClient.View
          dispatch={(c) => dispatch({ t: "tetris", c })}
          model={model.c}
        />
      );
    }

    case "snake": {
      return (
        <SnakeClient.View
          dispatch={(c) => dispatch({ t: "snake", c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case "maze": {
      return (
        <MazeClient.View
          dispatch={(c) => dispatch({ t: "maze", c })}
          model={model.c}
          ctx={ctx}
        />
      );
    }

    case "flow": {
      return <Flow.View {...input} model={model} />;
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const syncWithServer: Client["syncWithServer"] = (input) => {
  const { ctx, sendToServer, client, server } = input;
  switch (server.t) {
    case "chess": {
      if (client?.t === "chess") {
        const merged = ChessClient.syncWithServer({
          sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
          clientModel: client.c,
          serverModel: server.c,
        });

        return {
          model: { t: "chess", c: merged.model },
          cmd: Cmd.tag_("chess", merged.cmd),
        };
      }

      const initial = ChessClient.init();

      const merged = ChessClient.syncWithServer({
        sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
        clientModel: initial.model,
        serverModel: server.c,
      });

      return {
        model: {
          t: "chess",
          c: merged.model,
        },
        cmd: Cmd.batch([
          Cmd.tag_("chess", initial.cmd),
          Cmd.tag_("chess", merged.cmd),
        ]),
      };
    }

    case "connect-four": {
      return ConnectFour.syncWithServer({
        ...input,
        server,
        client: client?.t === "connect-four" ? client : undefined,
      });
    }

    case "tic-tac-toe": {
      if (client?.t === "tic-tac-toe") {
        return {
          model: {
            t: "tic-tac-toe",
            c: TicTacToeClient.syncWithServer({
              ctx,
              clientModel: client.c,
              serverModel: server.c,
            }),
          },
        };
      }

      const initial = TicTacToeClient.init;

      return {
        model: {
          t: "tic-tac-toe",
          c: TicTacToeClient.syncWithServer({
            ctx,
            clientModel: initial,
            serverModel: server.c,
          }),
        },
      };
    }

    case "gomoku": {
      if (client?.t === "gomoku") {
        return {
          model: {
            t: "gomoku",
            c: GomokuClient.syncWithServer({
              ctx,
              clientModel: client.c,
              serverModel: server.c,
            }),
          },
        };
      }

      return {
        model: {
          t: "gomoku",
          c: GomokuClient.syncWithServer({
            ctx,
            clientModel: GomokuClient.init,
            serverModel: server.c,
          }),
        },
      };
    }

    case "tetris": {
      if (client?.t === "tetris") {
        return {
          model: {
            t: "tetris",
            c: TetrisClient.syncWithServer({
              clientModel: client.c,
              serverModel: server.c,
            }),
          },
        };
      }

      return {
        model: {
          t: "tetris",
          c: TetrisClient.syncWithServer({
            clientModel: TetrisClient.init,
            serverModel: server.c,
          }),
        },
      };
    }

    case "snake": {
      if (client?.t === "snake") {
        return {
          model: {
            t: "snake",
            c: SnakeClient.syncWithServer({
              clientModel: client.c,
              serverModel: server.c,
            }),
          },
        };
      }

      return {
        model: {
          t: "snake",
          c: SnakeClient.syncWithServer({
            clientModel: SnakeClient.init,
            serverModel: server.c,
          }),
        },
      };
    }

    case "maze": {
      if (client?.t === "maze") {
        return {
          model: {
            t: "maze",
            c: MazeClient.syncWithServer({
              clientModel: client.c,
              serverModel: server.c,
            }),
          },
        };
      }

      return {
        model: {
          t: "maze",
          c: MazeClient.syncWithServer({
            clientModel: MazeClient.init({
              userId: ctx.currentUserId,
            }),
            serverModel: server.c,
          }),
        },
      };
    }

    case "flow": {
      return Flow.syncWithServer({
        ...input,
        server,
        client: client?.t === "flow" ? client : undefined,
      });
    }
  }
};
