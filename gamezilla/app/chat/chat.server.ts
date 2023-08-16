import { Eff } from "gamezilla/@SHARED/core";
import { ServerModel, ServerMsg, ToServer, ToClient } from "./chat.core";

type Model = ServerModel;

export const init: { model: Model } = { model: null };

type Msg = ServerMsg;

export const updateFromClient = ({
  model,
}: {
  msg: ToServer;
  model: Model;
  sendToClient: (m: ToClient) => Eff<Msg>;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  return { model };
};

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
