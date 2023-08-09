import { Cmd, Sub, andThen, p } from "@gamezilla/core";
import { GameSpaceMsg, GameSpaceReqCtx } from "src/libs/feat/game-space/shared";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  handleBotMove,
  initShared,
} from "./vs-bot.core";

//
//
//
// model
//
//
//

export type Model = ServerModel;

export const init = initShared;

//
//
//
// update
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
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "none": {
      return { model };
    }
  }
};

type updateFromClient = (input: {
  ctx: GameSpaceReqCtx;
  sendToClient: (m: ToClient) => Cmd;
  broadcast: (m: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
}) => {
  model: Model;
  cmd?: Cmd<Msg>;
};

export const updateFromClient: updateFromClient = (input) => {
  return p(
    input,
    andThen((model) => updateFromClient_({ ...input, model })),
    andThen((model) => updateBotMove({ ...input, model }))
  );
};

const updateBotMove: updateFromClient = ({ broadcast, model }) => {
  const handled = handleBotMove(model);

  if (handled.t === "err") {
    return {
      model,
      cmd: broadcast({ t: "bot-moved", result: handled }),
    };
  }

  const modelNew = handled.value;

  return {
    model: modelNew,
    // cmd: p(
    //   Time.delay(2000),
    //   Cmd.perform(() => null),
    //   Cmd.chain(() => broadcast({ t: 'bot-moved', result: Ok(modelNew) }))
    // ),
  };
};

const updateFromClient_: updateFromClient = ({
  ctx,
  sendToClient,
  broadcast,
  msg,
  model,
}) => {
  switch (msg.t) {
    default: {
      const res: Res = { ...msg, result: handle({ ctx, msg, model }) };
      if (res.result.t === "err") {
        return { model, cmd: sendToClient(res) };
      }
      return { model: res.result.value, cmd: broadcast(res) };
    }
  }
};

export const updateFromParent = ({
  msg,
  model,
}: {
  msg: GameSpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "user-joined") {
    return {
      model: init({ userId: model.userId }),
    };
  }

  return { model };
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
