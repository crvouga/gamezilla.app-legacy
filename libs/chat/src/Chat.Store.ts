import { Cmd, p, t } from '@gamezilla/core';
import * as Conversation from './Conversation.Store';
import * as Message from './Message.Store';
import { initialStore, Store } from './Types';

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

export type Msg = ['Conversation', Conversation.Msg] | ['Message', Message.Msg];

export type Action =
  | ['Chat', ['Conversation', Conversation.Action]]
  | ['Chat', ['Message', Message.Action]];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'Conversation': {
      const [modelNew, cmd] = Conversation.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('Conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'Conversation': {
      const [modelNew, cmd] = Conversation.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('Conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};
