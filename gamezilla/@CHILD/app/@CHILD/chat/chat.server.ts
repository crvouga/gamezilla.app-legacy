import { Eff } from "gamezilla/@SHARED/core";
import { ServerModel, ServerMsg, MsgToServer } from "./chat.core";

export const init: { model: ServerModel } = { model: null };

export const updateFromClient = ({
  model,
}: {
  msg: MsgToServer;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  return { model };
};

export const update = ({
  model,
}: {
  msg: ServerMsg;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<ServerMsg>;
} => {
  return { model };
};
