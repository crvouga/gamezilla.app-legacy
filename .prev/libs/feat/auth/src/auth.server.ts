import { Cmd } from '@gamezilla/shared/core';
import { ServerModel, ServerMsg, ToServer } from './auth.shared';

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init: Model = { sessions: {}, verifications: {} };

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

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
  msg: ToServer;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return {
    model,
  };
};
