import { Browser, Eff, RemoteResult, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";

//
//
//
// Model
//
//
//

export type ClientModel = {
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

export type ServerModel = null;

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | ["inputted-user-search", { userSearch: string }]
  | ["clicked-user-search-result", { userId: UserId }]
  | ["clicked-user-selected-delete-button", { userId: UserId }]
  | ["clicked-user-search-clear-button"]
  | ["focused", Browser.FocusResult]
  | Req;

export type Req =
  | ["chat-join", { chatId: string }]
  | ["chat-leave", { chatId: string }]
  | ["chat-list", { userId: UserId }]
  | ["chat-start", { userId: UserId[] }]
  | ["message-send", { chatId: string; text: string }]
  | ["message-unsend", { chatId: string; text: string }]
  | ["message-list", { chatId: string }];

type Problem = ["database-error", string];

export type Res = [...Req, Result<Problem, Partial<ClientModel>>];

export const update = ({ msg }: { msg: ClientMsg; model: ClientModel }) => {
  switch (msg[0]) {
    default: {
      return null;
    }
  }
};

export type ToServer = Req;

export type ServerMsg = Res;

export type ToClient = Res;

export const updateFromClient = ({
  msg,
}: {
  msg: ToServer;
  model: ServerModel;
}): {
  eff: Eff<ServerMsg>;
} => {
  switch (msg[0]) {
    default: {
      return {
        eff: () => {
          //
        },
      };
    }
  }
};
