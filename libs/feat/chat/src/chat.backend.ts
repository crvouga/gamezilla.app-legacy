import { Cmd } from '@gamezilla/shared/core';
import { ServerModel, ServerMsg, ToBackend, ToFrontend } from './chat.types';

type Model = ServerModel;

export const init: { model: Model } = { model: null };

type Msg = ServerMsg;

export const updateFromClient = ({
  model,
}: {
  msg: ToBackend;
  model: Model;
  sendToClient: (m: ToFrontend) => Cmd<Msg>;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
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
  cmd?: Cmd<Msg>;
} => {
  return { model };
};
