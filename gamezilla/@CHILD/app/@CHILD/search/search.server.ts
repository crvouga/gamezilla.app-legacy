import { Eff } from "gamezilla/@SHARED/core";
import { ServerModel, ServerMsg, MsgToServer } from "./search.core";

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
  eff?: Eff<Msg>;
} => {
  return { model };
};

export const updateFromClient = ({
  model,
  msg,
}: {
  msg: MsgToServer;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "search") {
    return { model };
  }
  return { model };
};
