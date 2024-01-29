import { Browser, Eff, RemoteResult, Result } from "gamezilla/@SHARED/core";
import { ChatId } from "./chat-id";
import { ChatMessageId } from "./chat-message-id";
import { ChatUserJoinId } from "./chat-user-join-id";
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
    [chatId: ChatId]: {
      chatId: ChatId;
    };
  };
  chatsUsers: {
    [chatsUsersId: ChatUserJoinId]: {
      chatsUsersId: ChatUserJoinId;
      chatId: ChatId;
      userId: UserId;
    };
  };
  users: {
    [userId: UserId]: {
      userId: UserId;
      chatId: ChatId;
    };
  };
  messages: {
    [messageId: ChatMessageId]: {
      messageId: ChatMessageId;
      chatId: ChatId;
    };
  };
  messageDrafts: {
    [chatId: ChatId]: {
      chatId: ChatId;
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

export type MsgToServer = Req;

export type ServerMsg = Res;

export type MsgToClient = Res;

export const updateFromClient = ({
  msg,
}: {
  msg: MsgToServer;
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
