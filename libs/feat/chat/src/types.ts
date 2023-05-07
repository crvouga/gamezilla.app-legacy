import { RemoteResult } from '@gamezilla/shared/core';
import { UserId } from '@gamezilla/shared/app';

//
//
//
// Model
//
//
//

export type Store = {
  Conversation: {
    [id: string]: Conversation;
  };
  Message: {
    [id: string]: Message;
  };
  UsersConversations: {
    [id: string]: UsersConversations;
  };
  queries: Queries;
  mutations: Mutations;
};

//
//
//
// Entities
//
//
//
export type UsersConversations = {
  userId: UserId;
  conversationId: string;
};
export const toUsersConversationsId = ({
  userId,
  conversationId,
}: {
  userId: UserId;
  conversationId: string;
}): string => {
  return [userId, conversationId].join(',');
};

export type Conversation = {
  conversationId: string;
};

export type Message = {
  messageId: string;
  conversationId: string;
  userId: UserId;
  message: string;
};

//
//
//
// Queries
//
//
//

export type Queries = {
  Conversation: {
    FindOne: {
      [id: string]: RemoteResult<
        Problem,
        {
          conversation: string;
          message: string[];
        }
      >;
    };
    FindManyByUserId: {
      [userId: UserId]: RemoteResult<
        Problem,
        {
          conversation: string[];
          usersConversations: string[];
        }
      >;
    };
  };
};

//
//
//
// Mutations
//
//
//

export type Mutations = {
  Conversation: {
    FindElseInsert: RemoteResult<Problem, string>;
  };
  Message: {
    Send: {
      [conversationId: string]: RemoteResult<Problem, string>;
    };
    Unsend: {
      [messageId: string]: RemoteResult<Problem, string>;
    };
  };
};

//
//
//
// Problem
//
//
//

export type Problem = string;

//
//
//
// Init
//
//
//

export const initialStore: Store = {
  Conversation: {},
  UsersConversations: {},
  Message: {},
  queries: {
    Conversation: {
      FindOne: {},
      FindManyByUserId: {},
    },
  },
  mutations: {
    Conversation: {
      FindElseInsert: RemoteResult.NotAsked,
    },
    Message: {
      Send: {},
      Unsend: {},
    },
  },
};
