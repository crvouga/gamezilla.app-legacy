import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import {
  SpaceEvent,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/app/space/@SHARED";
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
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "tick") {
    const modelNew = tick(model);
    return {
      model: modelNew,
      cmd: [{ t: "send-to-space", msg: { t: "tick-done", model: modelNew } }],
    };
  }
  return { model };
};

export const updateFromClient = ({
  msg,
  model,
  ctx,
}: {
  msg: ToServer;
  model: Model;
  ctx: SpaceReqCtx;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  const res: Res = { ...msg, result: handle({ req: msg, ctx, model }) };

  if (res.result.t === "err") {
    return {
      model,
      cmd: [{ t: "send-to-client", clientIds: [ctx.clientId], msg: res }],
    };
  }

  return {
    model: res.result.value,
    cmd: [{ t: "send-to-space", msg: res }],
  };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceEvent;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  cmd?: SpaceServerCmd<ToClient>[];
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
      cmd: [{ t: "send-to-space", msg: { t: "player-left", model: modelNew } }],
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
