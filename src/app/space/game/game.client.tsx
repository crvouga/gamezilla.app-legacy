import { Cmd, Sub, exhaustive } from "src/core";
import { ChessClient } from "src/app/space/game/chess";
import { ConnectFourClient } from "src/app/space/game/connect-four";
import { FlowClient } from "src/app/space/game/flow";
import { GomokuClient } from "src/app/space/game/gomoku";
import { MazeClient } from "src/app/space/game/maze";
import { SnakeClient } from "src/app/space/game/snake";
import { TetrisClient } from "src/app/space/game/tetris";
import { TicTacToeClient } from "src/app/space/game/tic-tac-toe";
import { GameClient, SpaceClientCtx } from "src/app/space/@shared";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./game.core";
import { ClientAppMsg } from "src/app/@shared/client";

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
          cmd: Cmd.t("chess", initial.cmd),
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
      cmd: Cmd.t("tic-tac-toe", updated.cmd),
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
      cmd: Cmd.t("chess", cmd),
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
      cmd: Cmd.t("flow", updated?.cmd ?? Cmd.None),
    };
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, sendToServer, msg, model } = input;
  if (msg.t === "connect-four" && model.t === "connect-four") {
    return ConnectFour.updateFromServer({ ...input, msg, model });
  }

  if (msg.t === "tic-tac-toe" && model.t === "tic-tac-toe") {
    const updated = TicTacToeClient.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      cmd: Cmd.t("tic-tac-toe", updated.cmd),
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
      cmd: Cmd.t("chess", updated.cmd),
      msgs: updated.msgs,
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

  switch (model.t) {
    case "chess": {
      return Sub.tag(
        "chess",
        ChessClient.subscriptions({
          now: ctx.now,
          intervalId,
          model: model.c,
        })
      );
    }

    case "connect-four": {
      return ConnectFour.subscriptions({ ...input, model });
    }

    case "tic-tac-toe": {
      return Sub.tag(
        "tic-tac-toe",
        TicTacToeClient.subscriptions({ model: model.c })
      );
    }
    case "flow": {
      return Flow.subscriptions({ ...input, model });
    }
  }
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
          spaceCtx={ctx}
          dispatch={(c) => dispatch({ t: "chess", c })}
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

export const syncWithServer = ({
  ctx,
  sendToServer,
  client,
  server,
}: {
  ctx: SpaceClientCtx;
  sendToServer: (m: ToServer) => Cmd;
  client?: ClientModel | null;
  server: ServerModel;
}): { model: ClientModel; cmd?: Cmd<ClientMsg>; msgs?: ClientAppMsg[] } => {
  switch (server.t) {
    case "chess": {
      const merged = ChessClient.syncWithServer({
        sendToServer: (msg) => sendToServer({ t: "chess", c: msg }),
        clientModel: client?.t === "chess" ? client.c : undefined,
        serverModel: server.c,
      });

      return {
        model: { t: "chess", c: merged.model },
        cmd: Cmd.t("chess", merged.cmd),
      };
    }

    case "connect-four": {
      const merged = ConnectFourClient.syncWithServer({
        ctx,
        server: server.c,
        client: client?.t === "connect-four" ? client.c : undefined,
        sendToServer: (m) => sendToServer({ t: "connect-four", c: m }),
      });
      return {
        model: { t: "connect-four", c: merged.model },
        cmd: Cmd.t("connect-four", merged.cmd),
        msgs: merged.msgs,
      };
    }

    case "tic-tac-toe": {
      const merged = TicTacToeClient.syncWithServer({
        ctx,
        clientModel: client?.t === "tic-tac-toe" ? client.c : undefined,
        serverModel: server.c,
      });
      return { model: { t: "tic-tac-toe", c: merged } };
    }

    case "flow": {
      const merged = FlowClient.syncWithServer({
        ctx,
        sendToServer: (m) => sendToServer({ t: "flow", c: m }),
        client: client?.t === "flow" ? client.c : null,
        server: server.c,
      });
      return {
        model: { t: "flow", c: merged.model },
        cmd: Cmd.t("flow", merged.cmd),
        msgs: merged.msgs,
      };
    }

    default: {
      const check: never = server;
      return check;
    }
  }
};
