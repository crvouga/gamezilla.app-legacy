import { RemoteData, Unit } from "../Core"
import { UserId, Username } from "../Data"

//
//
//
// Model
//
//
//

export type Store = {
  Profile: {
    [id: UserId.UserId]: Profile
  }
  Conversation: {
    [id: string]: Conversation
  }
  Message: {
    [id: string]: Message
  }
  ProfilesConversations: {
    [id: string]: ProfilesConversations
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

export type Profile = {
  userId: UserId.UserId
  username: Username.Username
  name: string
  avatarUrl: string
  themeMode: "Light" | "Dark" | "System"
}

export type ProfilesConversations = {
  userId: UserId.UserId
  conversationId: string
}
export const toProfilesConversationsId = ({
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

type FindManyKey = string & { _opaque: "FindManyKey" }

const seperator = ","

const isFindManyKey = (key: unknown): key is FindManyKey => {
  return (
    typeof key === "string" &&
    key.split(seperator).every((item) => UserId.is(item))
  )
}

export const toFindManyKey = (userIds: UserId.UserId[]): FindManyKey => {
  const key = userIds.sort().join(seperator)

  if (isFindManyKey(key)) {
    return key
  }

  throw new Error("Failed to create find many key")
}

export type Queries = {
  Profile: {
    FindMany: {
      [key: FindManyKey]: RemoteData.RemoteData<Problem, UserId.UserId[]>
    }
    Search: {
      [searchText: string]: RemoteData.RemoteData<Problem, UserId.UserId[]>
    }
  }

  Conversation: {
    FindOne: {
      [id: string]: RemoteData.RemoteData<
        Problem,
        {
          conversation: string
          message: string[]
          profile: string[]
        }
      >
    }
    FindManyByUserId: {
      [userId: UserId.UserId]: RemoteData.RemoteData<
        Problem,
        {
          profile: string[]
          conversation: string[]
          profilesConversations: string[]
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
  Profile: {
    Edit: {
      [userId: UserId.UserId]: RemoteData.RemoteData<Problem, UserId.UserId>
    }
    DeleteForever: {
      [userId: UserId.UserId]: RemoteData.RemoteData<Problem, Unit>
    }
    Create: {
      [userId: UserId.UserId]: RemoteData.RemoteData<Problem, UserId.UserId>
    }
  }
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
  Profile: {},
  Conversation: {},
  ProfilesConversations: {},
  Message: {},
  queries: {
    Conversation: {
      FindOne: {},
      FindManyByUserId: {},
    },
    Profile: {
      FindMany: {},
      Search: {},
    },
  },
  mutations: {
    Conversation: {
      FindElseInsert: RemoteData.NotAsked,
    },
    Profile: {
      Create: {},
      Edit: {},
      DeleteForever: {},
    },
    Message: {
      Send: {},
      Unsend: {},
    },
  },
}
