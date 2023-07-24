import { ChessClient } from "@gamezilla/game/chess";
import { ConnectFourClient } from "@gamezilla/game/connect-four";
import { FlowClient } from "@gamezilla/game/flow";
import { GomokuClient } from "@gamezilla/game/gomoku";
import { MazeClient } from "@gamezilla/game/maze";
import { SnakeClient } from "@gamezilla/game/snake";
import { TetrisClient } from "@gamezilla/game/tetris";
import { TicTacToeClient } from "@gamezilla/game/tic-tac-toe";
import {
  ClientAppMsg,
  Ctx,
  SpaceCtx,
  SpaceViewCtx,
} from "@gamezilla/shared/client";
import { Cmd, Sub, exhaustive } from "@gamezilla/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./game.core";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init = ({
  gameName,
  ctx,
}: {
  gameName: Model["t"];
  ctx: Ctx;
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case "tic-tac-toe": {
      return [{ t: "tic-tac-toe", c: TicTacToeClient.init }, Cmd.None];
    }

    case "connect-four": {
      return [{ t: "connect-four", c: ConnectFourClient.init }, Cmd.None];
    }

    case "chess": {
      const initial = ChessClient.init();
      return [{ t: "chess", c: initial.model }, Cmd.tag_("chess", initial.cmd)];
    }

    case "gomoku": {
      return [{ t: "gomoku", c: GomokuClient.init }, Cmd.None];
    }

    case "tetris": {
      return [{ t: "tetris", c: TetrisClient.init }, Cmd.None];
    }

    case "snake": {
      return [{ t: "snake", c: SnakeClient.init }, Cmd.None];
    }

    case "maze": {
      return [
        {
          t: "maze",
          c: MazeClient.init({
            userId: ctx.currentUserId,
          }),
        },
        Cmd.None,
      ];
    }

    case "flow": {
      return [{ t: "flow", c: FlowClient.init({}) }, Cmd.None];
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

export const update = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: SpaceCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (model.t === "connect-four" && msg.t === "connect-four") {
    const updated = ConnectFourClient.update({
      ctx,
      sendToServer: (msg) => sendToServer({ t: "connect-four", c: msg }),
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "connect-four", c: updated.model },
      cmd: Cmd.tag_("connect-four", updated.cmd),
    };
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
      msgs: ClientAppMsg.tag("tic-tac-toe", updated.msgs),
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

export const updateFromServer = ({
  ctx,
  sendToServer,
  msg,
  model,
}: {
  ctx: SpaceCtx;
  sendToServer: (msg: ToServer) => Cmd;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "connect-four" && model.t === "connect-four") {
    const [child, cmd] = ConnectFourClient.updateFromServer({
      msg: msg.c,
      ctx,
      model: model.c,
    });

    return {
      model: { t: "connect-four", c: child },
      cmd: Cmd.tag_("connect-four", cmd),
    };
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
    const updated = FlowClient.updateFromServer({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "flow", c: updated.model },
      cmd: Cmd.tag_("flow", updated.cmd),
    };
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

export const subscriptions = (
  intervalId: string,
  ctx: Ctx,
  model: Model
): Sub<Msg> => {
  if (model.t === "connect-four") {
    return Sub.tag_(
      "connect-four",
      ConnectFourClient.subscriptions(intervalId, ctx.now, model.c)
    );
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
    return Sub.tag_("flow", FlowClient.subscriptions(model.c));
  }

  const exhaustiveCheck: never = model;
  return exhaustiveCheck;
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: SpaceViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  switch (model.t) {
    case "connect-four": {
      return (
        <ConnectFourClient.View
          ctx={ctx}
          model={model.c}
          dispatch={(c) => dispatch({ t: "connect-four", c })}
        />
      );
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
      return (
        <FlowClient.View
          model={model.c}
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "flow", c })}
        />
      );
    }

    default: {
      return exhaustive(model);
    }
  }
};

export const syncWithServer = ({
  ctx,
  sendToServer,
  clientModel,
  serverModel,
}: {
  ctx: Ctx;
  sendToServer: (msg: ToServer) => Cmd;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): [ClientModel, Cmd<Msg>] => {
  switch (serverModel.t) {
    case "chess": {
      if (clientModel.t === "chess") {
        const merged = ChessClient.syncWithServer({
          sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
          clientModel: clientModel.c,
          serverModel: serverModel.c,
        });

        return [{ t: "chess", c: merged.model }, Cmd.tag_("chess", merged.cmd)];
      }

      const initial = ChessClient.init();

      const merged = ChessClient.syncWithServer({
        sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
        clientModel: initial.model,
        serverModel: serverModel.c,
      });

      return [
        {
          t: "chess",
          c: merged.model,
        },
        Cmd.batch([
          Cmd.tag_("chess", initial.cmd),
          Cmd.tag_("chess", merged.cmd),
        ]),
      ];
    }

    case "connect-four": {
      if (clientModel.t === "connect-four") {
        return [
          {
            t: "connect-four",
            c: ConnectFourClient.syncWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = ConnectFourClient.init;

      return [
        {
          t: "connect-four",
          c: ConnectFourClient.syncWithServer({
            ctx,
            clientModel: initial,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "tic-tac-toe": {
      if (clientModel.t === "tic-tac-toe") {
        return [
          {
            t: "tic-tac-toe",
            c: TicTacToeClient.syncWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      const initial = TicTacToeClient.init;

      return [
        {
          t: "tic-tac-toe",
          c: TicTacToeClient.syncWithServer({
            ctx,
            clientModel: initial,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "gomoku": {
      if (clientModel.t === "gomoku") {
        return [
          {
            t: "gomoku",
            c: GomokuClient.syncWithServer({
              ctx,
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: "gomoku",
          c: GomokuClient.syncWithServer({
            ctx,
            clientModel: GomokuClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "tetris": {
      if (clientModel.t === "tetris") {
        return [
          {
            t: "tetris",
            c: TetrisClient.syncWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: "tetris",
          c: TetrisClient.syncWithServer({
            clientModel: TetrisClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "snake": {
      if (clientModel.t === "snake") {
        return [
          {
            t: "snake",
            c: SnakeClient.syncWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },

          Cmd.None,
        ];
      }

      return [
        {
          t: "snake",
          c: SnakeClient.syncWithServer({
            clientModel: SnakeClient.init,
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "maze": {
      if (clientModel.t === "maze") {
        return [
          {
            t: "maze",
            c: MazeClient.syncWithServer({
              clientModel: clientModel.c,
              serverModel: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: "maze",
          c: MazeClient.syncWithServer({
            clientModel: MazeClient.init({
              userId: ctx.currentUserId,
            }),
            serverModel: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }

    case "flow": {
      if (clientModel.t === "flow") {
        return [
          {
            t: "flow",
            c: FlowClient.syncWithServer({
              client: clientModel.c,
              server: serverModel.c,
            }),
          },
          Cmd.None,
        ];
      }

      return [
        {
          t: "flow",
          c: FlowClient.syncWithServer({
            client: FlowClient.init({}),
            server: serverModel.c,
          }),
        },
        Cmd.None,
      ];
    }
  }
};
