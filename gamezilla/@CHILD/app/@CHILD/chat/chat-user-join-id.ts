import { Uuid } from "gamezilla/@SHARED/core";

export type ChatUserJoinId = string & {
  readonly ChatMessageId: unique symbol;
};

const generate = (): ChatUserJoinId => {
  const id = Uuid.generate();
  return `chat-user-join:${id}` as ChatUserJoinId;
};

const is = (id: unknown): id is ChatUserJoinId => {
  return typeof id === "string" && id.startsWith("chat-user-join:");
};

export const ChatUserJoinId = {
  generate,
  is,
};
