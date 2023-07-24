import { SpaceMsg } from "@gamezilla/shared/client";
import { Cmd, Sub, Time } from "@gamezilla/core";
import { SpaceReqServerCtx } from "@gamezilla/shared/server";
import {
  handle,
  initShared,
  Res,
  ServerModel,
  ServerMsg,
  tick,
  ToClient,
  toPlayerType,
  ToServer,
} from "./vs-user.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initShared;

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
}: {
  broadcast: (msg: ToClient) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "tick") {
    const modelNew = tick(model);
    return {
      model: modelNew,
      cmd: broadcast({ t: "tick-done", model: modelNew }),
    };
  }
  return { model };
};

export const updateFromClient = ({
  sendToClient,
  broadcast,
  msg,
  model,
  ctx,
}: {
  sendToClient: (msg: ToClient) => Cmd;
  broadcast: (msg: ToClient) => Cmd;
  msg: ToServer;
  model: Model;
  ctx: SpaceReqServerCtx;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const res: Res = { ...msg, result: handle({ req: msg, ctx, model }) };

  if (res.result.t === "err") {
    return { model, cmd: sendToClient(res) };
  }

  return { model: res.result.value, cmd: broadcast(res) };
};

export const updateFromSpace = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Cmd;
  msg: SpaceMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "user-left") {
    const userId = msg.userId;
    const player = toPlayerType(userId, model);

    if (player === null) {
      return { model };
    }

    const modelNew: Model = {
      type: "setup",
      moveTimeLimit: model.moveTimeLimit,
      players: {
        ...model.players,
        [player]: null,
      },
    };

    return {
      model: modelNew,
      cmd: broadcast({ t: "player-left", model: modelNew }),
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  if (model.type === "game") {
    return Time.every(intervalId, 1000, () => ({ t: "tick" }));
  }

  return Sub.None;
};
