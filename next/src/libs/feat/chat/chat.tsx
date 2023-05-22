import { UserId } from '@gamezilla/shared/app';
import { Cmd, RemoteResult } from '@gamezilla/shared/core';
import { Route, ViewCtx } from '@gamezilla/shared/client';
import {
  Avatar,
  AvatarGroup,
  Box,
  FillBox,
  Icons,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TopBar,
  ViewEmptyState,
  ViewLoadingState,
} from '@gamezilla/shared/ui';
import { Fab } from '@mui/material';
import * as ChatStore from './chat.store';
//
//
//
// Model
//
//
//
export type Model = null;

export const init = ({
  userId,
}: {
  userId: UserId;
}): [Model, Cmd<Msg>, OutAction[]] => {
  return [
    null,
    Cmd.None,
    [['chat', ['conversation', ['FindManyByUserId', { userId }]]]],
  ];
};

//
//
//
// Update
//
//
//

export type Msg =
  | ['clicked-back']
  | ['clicked-send-message']
  | ['ClickedConversationItem', { conversationId: string }];

type OutAction = ChatStore.Action;

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'clicked-back':
      return [model, Route.back];

    case 'clicked-send-message':
      return [model, Cmd.None];

    case 'ClickedConversationItem':
      return [model, Cmd.None];
  }
};

//
//
//
// View
//
//
//

export const View = ({
  chatStore,
  $send,
  ctx,
}: {
  chatStore: ChatStore.Model;
  ctx: ViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const { currentUserId, profiles } = ctx;
  const query =
    chatStore.queries.Conversation.FindManyByUserId[currentUserId] ??
    RemoteResult.NotAsked;

  const conversations = Object.values(chatStore.UsersConversations)
    .filter((item) => item.userId === currentUserId)
    .flatMap((item) => {
      const filtered = Object.values(profiles)
        .filter((profile) => profile.userId === item.userId)
        .filter((profile) => profile.userId !== currentUserId);

      if (filtered.length === 0) {
        return [];
      }

      return [
        {
          ...item,
          profiles: filtered,
        },
      ];
    });

  return (
    <FillBox sx={{ position: 'relative' }}>
      <Fab
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
        color="primary"
        variant="extended"
        onClick={() => $send(['clicked-send-message'])}
      >
        <Icons.Send sx={{ mr: 1 }} />
        Send Message
      </Fab>

      <Box
        sx={{
          flex: 1,
          overflowY: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar title="Chat" />

        {query.t === 'loading' ? (
          <ViewLoadingState title="Loading conversations..." />
        ) : (
          <>
            {conversations.length === 0 && (
              <ViewEmptyState
                title="No messages"
                renderIcon={({ sx }) => <Icons.Chat sx={sx} />}
              />
            )}

            {conversations.length > 0 && (
              <List sx={{ overflowY: 'scroll' }}>
                {conversations.map((item) => (
                  <ListItemButton
                    key={item.conversationId}
                    onClick={() => $send(['ClickedConversationItem', item])}
                  >
                    <ListItemAvatar>
                      <AvatarGroup max={2}>
                        {item.profiles.map((profile) => (
                          <Avatar
                            key={profile.userId}
                            src={profile.avatarUrl}
                          />
                        ))}
                      </AvatarGroup>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.profiles
                        .map((item) => item.username)
                        .join(', ')}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </FillBox>
  );
};
