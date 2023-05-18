import { Cmd } from '@gamezilla/shared/core';
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from './chat.types';

type Model = BackendModel;

export const init: { model: Model } = { model: null };

type Msg = BackendMsg;

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
