import { Cmd, Sub, Time } from "gamezilla/@SHARED/core";
import {
  ServerModel,
  ServerMsg,
  initShared,
  inputDrop,
  inputRotate,
  inputTranslate,
  mouseMove,
  tick,
  ToServer,
  ToClient,
} from "./tetris.core";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = initShared;

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
      const modelNext = tick(model);

      return [modelNext, broadcast(["Tick_Done", modelNext])];
    }
  }
};

export const updateFromClient = (
  {
    broadcast,
    sendToClient,
  }: {
    broadcast: (msg: ToClient) => Cmd;
    sendToClient: (msg: ToClient) => Cmd;
  },
  msg: ToServer,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "MouseMove": {
      const toClient = mouseMove(msg, model);

      if (toClient[1].t === "err") {
        return [model, sendToClient(toClient)];
      }

      const modelNew = toClient[1].value;

      return [modelNew, broadcast(toClient)];
    }

    case "InputDrop": {
      const result = inputDrop(model);

      if (result.t === "err") {
        return [model, sendToClient(["InputDrop_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["InputDrop_Done", result])];
    }

    case "InputTranslate": {
      const result = inputTranslate(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["InputTranslate_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["InputTranslate_Done", result])];
    }

    case "InputRotate": {
      const result = inputRotate(model);

      if (result.t === "err") {
        return [model, sendToClient(["InputRotate_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["InputRotate_Done", result])];
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

export const subscriptions = (intervalId: string, _model: Model): Sub<Msg> => {
  return Time.every(intervalId, 500, (): Msg => ["tick"]);
};
