import { Cmd, Sub } from '@gamezilla/core';
import { FrontendModel, FrontendMsg, ToFrontend } from './profile-.types';

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: [Model, Cmd<Msg>] = [null, Cmd.None];

//
//
//
// update
//
//
//

export type Msg = FrontendMsg;

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'find_many': {
      return [model, Cmd.None];
    }
  }
};

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'find_many_done': {
      return [model, Cmd.None];
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

//
//
//
// view
//
//
//

export const view = (model: Model) => {
  return <pre>{JSON.stringify(model, null, 2)}</pre>;
};
