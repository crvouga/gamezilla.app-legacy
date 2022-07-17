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
      [userId: string]: RemoteData.Model<Problem, string>;
    };
    GetMany: RemoteData.Model<Problem, string[]>;
    Search: {
      [searchText: string]: RemoteData.Model<Problem, string[]>;
    };
  };

  Conversation: {
    FindOne: {
      [id: string]: RemoteData.Model<
        Problem,
        {
          conversation: string;
          message: string[];
          profile: string[];
        }
      >;
    };
    FindManyByUserId: {
      [userId: string]: RemoteData.Model<
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
      [userId: string]: RemoteData.Model<Problem, string>;
    };
    DeleteForever: {
      [userId: string]: RemoteData.Model<Problem, string>;
    };
    Create: {
      [userId: string]: RemoteData.Model<Problem, string>;
    };
  };
  Conversation: {
    FindElseInsert: RemoteData.Model<Problem, string>;
  };
  Message: {
    Insert: {
      [conversationId: string]: RemoteData.Model<Problem, string>;
    };
    DeleteForever: {
      [messageId: string]: RemoteData.Model<Problem, string>;
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
