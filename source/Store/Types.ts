import { RemoteData } from "Core";

//
//
//
// Model
//
//
//

export type Store = {
  Profile: {
    [id: string]: Profile;
  };
  Conversation: {
    [id: string]: Conversation;
  };
  Message: {
    [id: string]: Message;
  };
  ProfilesConversations: {
    [id: string]: ProfilesConversations;
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

export type Profile = {
  userId: string;
  username: string;
  name: string;
  avatarUrl: string;
  themeMode: "Light" | "Dark" | "System";
};

export type ProfilesConversations = {
  userId: string;
  conversationId: string;
};
export const toProfilesConversationsId = ({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}): string => {
  return [userId, conversationId].join(",");
};

export type Conversation = {
  conversationId: string;
};

export type Message = {
  messageId: string;
  conversationId: string;
  userId: string;
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
  Profile: {
    Get: {
      [userId: string]: RemoteData.RemoteData<Problem, string>;
    };
    GetMany: RemoteData.RemoteData<Problem, string[]>;
    Search: {
      [searchText: string]: RemoteData.RemoteData<Problem, string[]>;
    };
  };

  Conversation: {
    FindOne: {
      [id: string]: RemoteData.RemoteData<
        Problem,
        {
          conversation: string;
          message: string[];
          profile: string[];
        }
      >;
    };
    FindManyByUserId: {
      [userId: string]: RemoteData.RemoteData<
        Problem,
        {
          profile: string[];
          conversation: string[];
          profilesConversations: string[];
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
  Profile: {
    Edit: {
      [userId: string]: RemoteData.RemoteData<Problem, string>;
    };
    DeleteForever: {
      [userId: string]: RemoteData.RemoteData<Problem, string>;
    };
    Create: {
      [userId: string]: RemoteData.RemoteData<Problem, string>;
    };
  };
  Conversation: {
    FindElseInsert: RemoteData.RemoteData<Problem, string>;
  };
  Message: {
    Insert: {
      [conversationId: string]: RemoteData.RemoteData<Problem, string>;
    };
    DeleteForever: {
      [messageId: string]: RemoteData.RemoteData<Problem, string>;
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

export type Problem = { message: string };
