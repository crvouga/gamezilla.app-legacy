import { Cmd, Sub } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';
import { BackendModel, BackendMsg, ToBackend, initShared } from './flow.types';

type Model = BackendModel;

export const init = ({ playerId }: { playerId?: UserId }): Model => {
  return {
    ...initShared,
    playerId,
  };
};

type Msg = BackendMsg;

type Update<Msg, Model> = (input: { msg: Msg; model: Model }) => {
  model: Model;
  cmd?: Cmd<Msg>;
};

export const update: Update<Msg, Model> = ({ msg, model }) => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
};

export const updateFromFrontend: Update<ToBackend, Model> = ({
  msg,
  model,
}) => {
  switch (msg[0]) {
    case 'none': {
      return { model };
    }
  }
};

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
