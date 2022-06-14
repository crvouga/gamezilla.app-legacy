export type Store = {
  profiles: {
    [userId: string]: Profile;
  };
  conversation: {
    [conversationId: string]: Conversation;
  };
  profiles_conversations: {
    [id: string]: {
      userId: string;
      conversationId: string;
    };
  };
};

type Profile = {};

type Conversation = {};
