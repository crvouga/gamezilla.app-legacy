import { Browser, Cmd, RemoteResult, Result } from '@gamezilla/core';
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
  requests: {
    [key in Req[0]]?: RemoteResult<Problem, null>;
  };
  userSearch: string;
  userSelected: {
    [userId: UserId]: UserId;
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

export type FrontendMsg =
  | ['inputted-user-search', { userSearch: string }]
  | ['clicked-user-search-result', { userId: UserId }]
  | ['clicked-user-selected-delete-button', { userId: UserId }]
  | ['clicked-user-search-clear-button']
  | ['focused', Browser.FocusResult]
  | Req;

export type Req =
  | ['chat-join', { chatId: string }]
  | ['chat-leave', { chatId: string }]
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

export type ToBackend = Req;

export type BackendMsg = Res;

export type ToFrontend = Res;

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
