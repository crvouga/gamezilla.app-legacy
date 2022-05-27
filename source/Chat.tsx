//
//
//
// Model
//
//
//

export type Model = {
  conversations: {
    [conversationId: string]: Conversation;
  };
};

export type Conversation = {
  conversationId: string;
};

export type Message = {
  messageId: string;
  conversationId: string;
};

export type MessageRecipient = {
  messageRecipientId: string;
  senderId: string;
  recieverId: string;
  conversationId: string;
};
