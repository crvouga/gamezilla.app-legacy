import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import {
  ServerModel,
  ServerMsg,
  handle,
  initShared,
  Res,
  tick,
  ToServer,
  ToClient,
} from "./maze.core";
import { TimeSpan } from "gamezilla/@SHARED/core/time-span";

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

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const modelNew = tick(model);
      return [modelNew, Eff.None];
    }
  }
};

export const updateFromClient = (
  msg: ToServer,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "stop-game":
    case "input-direction":
    case "input-seed":
    case "start-game":
    case "stop-playing":
    case "start-playing": {
      const res: Res = [...msg, handle(msg, model)];
      const modelNew = res[2].t === "ok" ? res[2].value : model;
      return [modelNew, Eff.None];
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

export const subscriptions = (
  intervalId: string,
  model: ServerModel
): Sub<Msg> => {
  if (model.type === "game") {
    return Time.every(intervalId, TimeSpan.fromSeconds(1 / 2), () => ["tick"]);
    // return Sub.None
  }
  return Sub.None;
};
