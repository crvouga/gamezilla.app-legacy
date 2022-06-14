//
//
//
// Model
//
//
//

export type Conversation = {
  conversationId: string;
};

export type MessageRecipient = {
  messageRecipientId: string;
  senderId: string;
  recieverId: string;
  conversationId: string;
};
