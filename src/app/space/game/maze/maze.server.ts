import { Cmd, Sub, Time } from "src/core";
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

export const update = (
  { broadcast }: { broadcast: (msg: ToClient) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const modelNew = tick(model);
      return [modelNew, broadcast(["tick", modelNew])];
    }
  }
};

export const updateFromClient = (
  { broadcast }: { broadcast: (m: ToClient) => Cmd },
  msg: ToServer,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "stop-game":
    case "input-direction":
    case "input-seed":
    case "start-game":
    case "stop-playing":
    case "start-playing": {
      const res: Res = [...msg, handle(msg, model)];
      const modelNew = res[2].t === "ok" ? res[2].value : model;
      return [modelNew, broadcast(res)];
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
    return Time.every(intervalId, 500, () => ["tick"]);
    // return Sub.None
  }
  return Sub.None;
};
