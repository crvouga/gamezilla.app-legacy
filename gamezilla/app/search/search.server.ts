import { Cmd } from "gamezilla/core";
import { ServerModel, ServerMsg, ToServer } from "./search.core";

type Model = ServerModel;

export const init: { model: Model } = {
  model: null,
};

type Msg = ServerMsg;

export const update = ({
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  model,
  msg,
}: {
  msg: ToServer;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "search") {
    return { model };
  }
  return { model };
};
