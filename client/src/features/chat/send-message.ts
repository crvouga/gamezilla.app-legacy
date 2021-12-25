import { definitions, supabaseClient } from "src/supabase";
import { generateUuidv4 } from "src/utility";

type INewMessage =
  | {
      type: "TEXT";
      text: string;
      senderId: string;
      recipientIds: string[];
    }
  | {
      type: "GAME_INVITE";
      gameId: string;
      senderId: string;
      recipientIds: string[];
    };

const toMessageRow = (
  messageId: string,
  message: INewMessage
): Omit<definitions["messages"], "created_at"> => {
  switch (message.type) {
    case "GAME_INVITE":
      return {
        id: messageId,
        type: "GAME_INVITE",
        sender_id: message.senderId,
        payload: JSON.stringify({
          gameId: message.gameId,
        }),
      };

    case "TEXT":
      return {
        id: messageId,
        type: "TEXT",
        sender_id: message.senderId,
        payload: JSON.stringify({
          text: message.text,
        }),
      };
  }
};

const toMessageRecipientRows = (
  messageId: string,
  message: INewMessage
): Omit<definitions["message_recipients"], "id">[] => {
  return message.recipientIds.map((recipient_id) => ({
    recipient_id,
    message_id: messageId,
  }));
};

export const sendMessage = async (message: INewMessage) => {
  const messageId = generateUuidv4();

  await supabaseClient
    .from<definitions["messages"]>("messages")
    .insert(toMessageRow(messageId, message));

  await supabaseClient
    .from<definitions["message_recipients"]>("message_recipients")
    .insert(toMessageRecipientRows(messageId, message));
};
