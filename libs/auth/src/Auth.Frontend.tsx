import { Cmd } from '@gamezilla/core';
import { FrontendModel, FrontendMsg, ToBackend, ToFrontend } from './auth.Type';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = { session: { type: 'Loading' } };

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg;

export type Action = ['Auth', FrontendMsg];

export const update = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'VerifyCode':
    case 'LoginWithCode': {
      return [model, sendToBackend(msg)];
    }
  }
};

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'VerifyCode_Done':
    case 'LoginWithCode_Done': {
      return [model, Cmd.None];
    }
  }
};
