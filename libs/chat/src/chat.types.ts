import { Cmd, RemoteData, Result } from '@gamezilla/core';
import { UserId } from '@gamezilla/shared';

//
//
//
// Model
//
//
//

export type FrontendModel = {
  chats: {
    [chatId: string]: {
      chatId: string;
    };
  };
  chatsUsers: {
    [chatsUsersId: string]: {
      chatsUsersId: string;
      chatId: string;
      userId: UserId;
    };
  };
  users: {
    [userId: UserId]: {
      userId: UserId;
      chatId: string;
    };
  };
  messages: {
    [messageId: string]: {
      messageId: string;
      chatId: string;
    };
  };
  messageDrafts: {
    [chatId: string]: {
      chatId: string;
      text: string;
    };
  };
  userSearch: string;
  requests: {
    [key in Req[0]]?: RemoteData<Problem, null>;
  };
};

export type BackendModel = null;

//
//
//
// Msg
//
//
//

export type FrontendMsg = Req;

export type Req =
  | ['chat-list', { userId: UserId }]
  | ['chat-start', { userId: UserId[] }]
  | ['message-send', { chatId: string; text: string }]
  | ['message-unsend', { chatId: string; text: string }]
  | ['message-list', { chatId: string }];

type Problem = ['database-error', string];

export type Res = [...Req, Result<Problem, Partial<FrontendModel>>];

export const update = ({ msg }: { msg: FrontendMsg; model: FrontendModel }) => {
  switch (msg[0]) {
    default: {
      return null;
    }
  }
};

type ToBackend = Req;

type BackendMsg = Res;

export const updateFromFrontend = ({
  msg,
}: {
  msg: ToBackend;
  model: BackendModel;
}): {
  cmd: Cmd<BackendMsg>;
} => {
  switch (msg[0]) {
    default: {
      return {
        cmd: () => {
          //
        },
      };
    }
  }
};
