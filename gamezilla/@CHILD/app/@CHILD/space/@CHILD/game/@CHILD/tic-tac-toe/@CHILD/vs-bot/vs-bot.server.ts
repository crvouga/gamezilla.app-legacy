import { Eff, err, ok, Sub, andThen, p } from "gamezilla/@SHARED/core";
import {
  SpaceServerEvt,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { TicTacToe } from "../../@SHARED/tic-tic-toe";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initCoreModel,
  isBotTurn,
} from "./vs-bot.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initCoreModel;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "bot-moved") {
    if (model.type !== "game") {
      return {
        model,
        cmd: [
          {
            t: "send-to-space",
            msg: {
              t: "bot-moved",
              result: err("The bot moved not during game mode"),
            },
          },
        ],
      };
    }

    const moved = TicTacToe.move({
      position: {
        column: 0,
        row: 0,
      },
      board: model.board,
      player: TicTacToe.toOpposite(model.userPlayerType),
    });

    if (moved.t === "err") {
      return {
        model,
        cmd: [{ t: "send-to-space", msg: { t: "bot-moved", result: moved } }],
      };
    }

    const modelNew: Model = {
      ...model,
      board: moved.value,
    };

    return {
      model: modelNew,
      cmd: [
        { t: "send-to-space", msg: { t: "bot-moved", result: ok(modelNew) } },
      ],
    };
  }
  return { model };
};

//
//
//
//
//

export const updateFromClient = (input: {
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  return p(
    input,
    andThen((model) => updateFromClientMain({ ...input, model })),
    andThen((model) => watchBotMove({ model, modelPrev: input.model }))
  );
};

const watchBotMove = ({
  model,
  modelPrev,
}: {
  model: Model;
  modelPrev: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (!isBotTurn(modelPrev) && isBotTurn(model)) {
    return {
      model,
    };
  }
  return { model };
};

const updateFromClientMain: typeof updateFromClient = ({ msg, model, ctx }) => {
  const handled = handle({ ctx, model, msg });
  const res: Res = { ...msg, result: handled };
  const modelNew: Model = handled.t === "ok" ? handled.value : model;
  return {
    model: modelNew,
    cmd: [{ t: "send-to-space", msg: res }],
  };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvt;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "user-left") {
    if (model.player !== msg.userId) {
      return { model };
    }

    const modelNew: Model = {
      type: "setup",
      botLevel: model.botLevel,
      player: null,
      userPlayerType: model.userPlayerType,
    };

    return {
      model: modelNew,
      cmd: [
        { t: "send-to-space", msg: { t: "player-left", result: ok(modelNew) } },
      ],
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

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
