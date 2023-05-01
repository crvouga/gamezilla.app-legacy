import { Cmd } from '@gamezilla/core';
import { BackendModel, BackendMsg, ToBackend } from './search.types';

type Model = BackendModel;

export const init: { model: Model } = {
  model: null,
};

type Msg = BackendMsg;

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

export const updateFromFrontend = ({
  model,
  msg,
}: {
  msg: ToBackend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === 'search') {
    return { model };
  }
  return { model };
};
