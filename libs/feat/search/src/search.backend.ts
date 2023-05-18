import { Cmd } from '@gamezilla/shared/core';
import { ServerModel, ServerMsg, ToBackend } from './search.types';

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
