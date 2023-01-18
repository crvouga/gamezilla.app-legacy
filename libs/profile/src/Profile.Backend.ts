import { Cmd, Sub } from '@gamezilla/core';
import { BackendModel, BackendMsg, Req, ToBackend } from './Profile.Types';

//
//
//
// model
//
//
//

export type Model = BackendModel;

export const init: [Model, Cmd<Msg>] = [null, Cmd.None];

//
//
//
// update
//
//
//

export type Msg = BackendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'none': {
      return [model, Cmd.None];
    }
  }
};

export const updateFromFrontend = (
  msg: ToBackend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'find_many': {
      return [model, Cmd.None];
    }
  }
};

export const msgToQuery = (msg: Req) => {
  switch (msg[0]) {
    case 'find_many': {
      const userIds = msg[1].userId.map((x) => `'${x}'`).join(',');

      return `SELECT * FROM profile WHERE user_id IN (${userIds})`;
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None;
};
