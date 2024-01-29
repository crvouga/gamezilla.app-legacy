import { Eff } from "gamezilla/@SHARED/core";
import { ServerModel, MsgServer, MsgToServer } from "./chat.core";

export const init: { model: ServerModel } = { model: null };

export const updateFromClient = ({
  model,
}: {
  msg: MsgToServer;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<MsgServer>;
} => {
  return { model };
};

export const update = ({
  model,
}: {
  msg: MsgServer;
  model: ServerModel;
}): {
  model: ServerModel;
  eff?: Eff<MsgServer>;
} => {
  return { model };
};
