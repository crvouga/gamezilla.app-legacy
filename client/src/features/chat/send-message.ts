import { generateUuidv4 } from "src/utility";
import { createConversation } from "./ChatPage";

type INewMessage =
  | {
      type: "TEXT";
      text: string;
      senderId: string;
      recipientId: string;
    }
  | {
      type: "GAME_INVITE";
      gameId: string;
      senderId: string;
      recipientId: string;
    };

export const sendMessage = async ({ senderId, recipientId }: INewMessage) => {
  const messageId = generateUuidv4();

  const conversationId = generateUuidv4();

  await createConversation({
    conversationId: conversationId,
    userIds: [senderId, recipientId],
  });

  console.log({ messageId });
};
