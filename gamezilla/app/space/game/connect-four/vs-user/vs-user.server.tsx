import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import { SpaceEvent, SpaceReqCtx } from "gamezilla/app/space/@SHARED";
import {
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  handle,
  initShared,
  tick,
  toPlayerType,
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
  broadcast: (msg: ToClient) => Eff;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "tick") {
    const modelNew = tick(model);
    return {
      model: modelNew,
      eff: broadcast({ t: "tick-done", model: modelNew }),
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
  sendToClient: (msg: ToClient) => Eff;
  broadcast: (msg: ToClient) => Eff;
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  const res: Res = { ...msg, result: handle({ req: msg, ctx, model }) };

  if (res.result.t === "err") {
    return {
      model,
      eff: sendToClient(res),
    };
  }

  return {
    model: res.result.value,
    eff: broadcast(res),
  };
};

export const updateFromEvent = ({
  broadcast,
  msg,
  model,
}: {
  broadcast: (m: ToClient) => Eff;
  msg: SpaceEvent;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
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
      eff: broadcast({ t: "player-left", model: modelNew }),
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
