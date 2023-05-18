import { Cmd } from '@gamezilla/shared/core';
import { BackendModel, BackendMsg, ToBackend } from './auth.types';

//
//
//
// Model
//
//
//

export type Model = BackendModel;

export const init: Model = { sessions: {}, verifications: {} };

//
//
//
// Update
//
//
//

export type Msg = BackendMsg;

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
}: {
  msg: ToBackend;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return {
    model,
  };
};
