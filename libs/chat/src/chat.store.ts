import { Cmd, p, t } from '@gamezilla/core';
import * as Conversation from './conversation.store';
import * as Message from './message.store';
import { initialStore, Store } from './types';

//
//
//
// Model
//
//
//

export type Model = Store;

export const init = initialStore;

//
//
//
// Msg
//
//
//

export type Msg = ['conversation', Conversation.Msg] | ['Message', Message.Msg];

export type Action =
  | ['chat', ['conversation', Conversation.Action]]
  | ['chat', ['Message', Message.Action]];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'conversation': {
      const [modelNew, cmd] = Conversation.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'conversation': {
      const [modelNew, cmd] = Conversation.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};
