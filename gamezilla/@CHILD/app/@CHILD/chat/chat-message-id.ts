import { Uuid } from "gamezilla/@SHARED/core";

export type ChatMessageId = string & { readonly ChatMessageId: unique symbol };

const generate = (): ChatMessageId => {
  const id = Uuid.generate();
  return `chat-message:${id}` as ChatMessageId;
};

const is = (id: unknown): id is ChatMessageId => {
  return typeof id === "string" && id.startsWith("chat-message:");
};

export const ChatMessageId = {
  generate,
  is,
};
