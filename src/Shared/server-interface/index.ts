export type GetChatConversationsRequestParams = {
  page: number;
};

export type GetChatConversationsResponseBody = {
  data: {
    id: string;
    lastChatMessage: { message: string };
  }[];
};

export const GET_CHAT_MESSAGES_ENDPOINT = "/api/chat/converations";
