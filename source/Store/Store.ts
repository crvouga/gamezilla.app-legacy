import * as Conversation from "./Conversation";
import * as Profile from "./Profile";

export type Store = {
  profiles: {
    [userId: string]: Profile.Profile;
  };
  conversation: {
    [conversationId: string]: Conversation.Conversation;
  };
  profiles_conversations: {
    [id: string]: {
      userId: string;
      conversationId: string;
    };
  };
};
