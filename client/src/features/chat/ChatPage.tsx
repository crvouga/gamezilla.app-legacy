import { AppBar, Toolbar, Typography } from "@mui/material";
import React from "react";
import { definitions, supabaseClient } from "src/supabase";

type IConversation = {
  messageCount: string;
  users: {
    displayName: string;
    avatarUrl: string;
    id: string;
  }[];
};

export const createConversation = async ({
  conversationId,
  userIds,
}: {
  conversationId: string;
  userIds: string[];
}) => {
  await supabaseClient
    .from<definitions["conversation"]>("conversation")
    .insert({
      id: conversationId,
      user_ids: userIds,
    });

  await supabaseClient
    .from<definitions["conversation_x_user"]>("conversation_x_user")
    .insert(
      userIds.map((userId) => ({
        conversation_id: conversationId,
        user_id: userId,
      }))
    );
};

export const fetchConversation = async (_: {
  userIds: string[];
}): Promise<IConversation[]> => {
  return [];
};

export const fetchConversations = async ({
  userId,
}: {
  userId: string;
}): Promise<IConversation[]> => {
  console.log({ fetchConversations: userId });

  return [];
};

export const ChatPage = () => {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Chat</Typography>
        </Toolbar>
      </AppBar>
    </>
  );
};
