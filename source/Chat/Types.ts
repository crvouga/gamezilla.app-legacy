import { RemoteData } from "../Core"
import { UserId } from "../Data"

//
//
//
// Model
//
//
//

export type Store = {
  Conversation: {
    [id: string]: Conversation
  }
  Message: {
    [id: string]: Message
  }
  UsersConversations: {
    [id: string]: UsersConversations
  }
  queries: Queries
  mutations: Mutations
}

//
//
//
// Entities
//
//
//
export type UsersConversations = {
  userId: UserId.UserId
  conversationId: string
}
export const toUsersConversationsId = ({
  userId,
  conversationId,
}: {
  userId: UserId.UserId
  conversationId: string
}): string => {
  return [userId, conversationId].join(",")
}

export type Conversation = {
  conversationId: string
}

export type Message = {
  messageId: string
  conversationId: string
  userId: UserId.UserId
  message: string
}

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
      [id: string]: RemoteData.RemoteData<
        Problem,
        {
          conversation: string
          message: string[]
        }
      >
    }
    FindManyByUserId: {
      [userId: UserId.UserId]: RemoteData.RemoteData<
        Problem,
        {
          conversation: string[]
          usersConversations: string[]
        }
      >
    }
  }
}

//
//
//
// Mutations
//
//
//

export type Mutations = {
  Conversation: {
    FindElseInsert: RemoteData.RemoteData<Problem, string>
  }
  Message: {
    Send: {
      [conversationId: string]: RemoteData.RemoteData<Problem, string>
    }
    Unsend: {
      [messageId: string]: RemoteData.RemoteData<Problem, string>
    }
  }
}

//
//
//
// Problem
//
//
//

export type Problem = string

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
      FindElseInsert: RemoteData.NotAsked,
    },
    Message: {
      Send: {},
      Unsend: {},
    },
  },
}
