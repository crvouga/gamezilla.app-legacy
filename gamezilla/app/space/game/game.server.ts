import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ChessServer } from "gamezilla/app/space/game/chess";
import { ConnectFourServer } from "gamezilla/app/space/game/connect-four";
import { FlowServer } from "gamezilla/app/space/game/flow";
import { TicTacToeServer } from "gamezilla/app/space/game/tic-tac-toe";
import { GameServer, SpaceServerCmd } from "gamezilla/app/space/@SHARED";
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
  const { msg, model, ctx } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.update({ ...input, msg, model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    const updated = TicTacToeServer.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      eff: Eff.t("tic-tac-toe", updated.eff ?? Eff.None),
      cmd: SpaceServerCmd.tag("tic-tac-toe", updated.cmd),
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const updated = ChessServer.update({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "chess", c: updated.model },
      eff: Eff.t("chess", updated.eff),
      cmd: SpaceServerCmd.tag("chess", updated.cmd),
    };
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.update({ ...input, msg, model });
  }

  return { model };
};

export const updateFromClient: Server["updateFromClient"] = (input) => {
  const { ctx, msg, model } = input;

  if (model.t === "connect-four" && msg.t === "connect-four") {
    return ConnectFour.updateFromClient({ ...input, msg, model });
  }

  if (model.t === "tic-tac-toe" && msg.t === "tic-tac-toe") {
    const updated = TicTacToeServer.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return {
      model: { t: "tic-tac-toe", c: updated.model },
      eff: Eff.t("tic-tac-toe", updated.eff ?? Eff.None),
      cmd: SpaceServerCmd.tag("tic-tac-toe", updated.cmd),
    };
  }

  if (model.t === "chess" && msg.t === "chess") {
    const updated = ChessServer.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return {
      model: { t: "chess", c: updated.model },
      eff: Eff.t("chess", updated.eff),
      cmd: SpaceServerCmd.tag("chess", updated.cmd),
    };
  }

  if (model.t === "flow" && msg.t === "flow") {
    return Flow.updateFromClient({ ...input, model, msg });
  }

  return { model };
};

export const updateFromEvt: Server["updateFromEvt"] = (input) => {
  const { msg, model } = input;

  switch (model.t) {
    case "chess": {
      const updated = ChessServer.updateFromEvt({
        msg,
        model: model.c,
      });

      return {
        model: { t: "chess", c: updated.model },
        eff: Eff.t("chess", updated.eff ?? Eff.None),
      };
    }

    case "connect-four": {
      return ConnectFour.updateFromEvt({ ...input, model });
    }

    case "tic-tac-toe": {
      const updated = TicTacToeServer.updateFromEvt({
        msg,
        model: model.c,
      });
      return {
        model: { t: "tic-tac-toe", c: updated.model },
        cmd: SpaceServerCmd.tag("tic-tac-toe", updated.cmd),
      };
    }

    case "flow": {
      return Flow.updateFromEvt({ ...input, model });
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

export const subscriptions: Server["subscriptions"] = (
  intervalId,
  model
): Sub<Msg> => {
  switch (model.t) {
    case "connect-four": {
      return ConnectFour.subscriptions(intervalId, model);
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
      return Flow.subscriptions(intervalId, model);
    }
  }
};
