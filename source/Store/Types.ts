import { RemoteData } from "Core"

//
//
//
// Model
//
//
//

export type Store = {
  Profile: {
    [id: string]: Profile
  }
  Conversation: {
    [id: string]: Conversation
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
  userId: string
  username: string
  name: string
  avatarUrl: string
  themeMode: "Light" | "Dark" | "System"
}

export type ProfilesConversations = {
  userId: string
  conversationId: string
}
export const toProfilesConversationsId = ({
  userId,
  conversationId,
}: {
  userId: string
  conversationId: string
}): string => {
  return [userId, conversationId].join(",")
}

export type Conversation = {
  conversationId: string
}

//
//
//
// Queries
//
//
//

export type Queries = {
  Profile: {
    Get: {
      [userId: string]: RemoteData.RemoteData<Problem, string>
    }
    Search: {
      [searchText: string]: RemoteData.RemoteData<Problem, string[]>
    }
  }

  Conversation: {
    Get: {
      [id: string]: RemoteData.RemoteData<Problem, string>
    }
    FindManyByUserId: {
      [userId: string]: RemoteData.RemoteData<
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
      [userId: string]: RemoteData.RemoteData<Problem, string>
    }
    DeleteForever: {
      [userId: string]: RemoteData.RemoteData<Problem, string>
    }
    Create: {
      [userId: string]: RemoteData.RemoteData<Problem, string>
    }
  }
  Conversation: {
    GetElseCreate: RemoteData.RemoteData<Problem, string>
  }
}

//
//
//
// Problem
//
//
//

export type Problem = { message: string }
