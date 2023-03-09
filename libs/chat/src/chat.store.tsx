import { Cmd, p, t } from '@gamezilla/core';
import { Ctx } from '@gamezilla/shared';
import {
  Avatar,
  AvatarGroup,
  Box,
  FillBox,
  Header,
  Icons,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ViewEmptyState,
  ViewLoadingState,
} from '@gamezilla/shared/ui';
import { Fab } from '@mui/material';
import * as Conversation from './conversation.store';
import * as Message from './message.store';
import { initialStore, Store } from './types';

//
//
//
// Model
//
//
//

export type Model = Store;

export type Model_ = {
  chats: {
    [chatId: string]: {
      chatId: string;
    };
  };
  users: {
    [userId: string]: {
      userId: string;
      chatId: string;
    };
  };
  messages: {
    [messageId: string]: {
      messageId: string;
      chatId: string;
    };
  };
  messageDrafts: {
    [chatId: string]: {
      chatId: string;
      text: string;
    };
  };
  userSearch: string;
};

export const init = initialStore;

//
//
//
// Msg
//
//
//

export type Msg = ['conversation', Conversation.Msg] | ['Message', Message.Msg];

export type Action =
  | ['chat', ['conversation', Conversation.Action]]
  | ['chat', ['Message', Message.Action]];

//
//
//
// Update
//
//
//

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'conversation': {
      const [modelNew, cmd] = Conversation.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.update(msg[1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};

export const runAction = (action: Action, model: Model): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case 'conversation': {
      const [modelNew, cmd] = Conversation.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('conversation')))];
    }

    case 'Message': {
      const [modelNew, cmd] = Message.runAction(action[1][1], model);
      return [modelNew, p(cmd, Cmd.map(t('Message')))];
    }
  }
};

export const View = ({
  model,
  $send,
  ctx,
  route,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: Ctx;
  route: 'chat' | 'chat-new' | 'chat-list';
}) => {
  switch (route) {
    case 'chat': {
      return <ViewPageChat model={model} $send={$send} />;
    }
    case 'chat-new': {
      return <ViewPageChatNew model={model} $send={$send} />;
    }
    case 'chat-list': {
      return <ViewPageChatList model={model} $send={$send} ctx={ctx} />;
    }
  }
};

const ViewPageChat = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <div>hello</div>;
};

const ViewPageChatNew = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <div>hello</div>;
};

const ViewPageChatList = ({
  model,
  // $send,
  ctx,
}: {
  ctx: Ctx;
  model: Model;
  $send: (m: Msg) => void;
}) => {
  const query = model.queries.Conversation.FindManyByUserId[
    ctx.currentUserId
  ] ?? { type: 'Loading' };

  const conversations = Object.values(model.UsersConversations)
    .filter((item) => item.userId === ctx.currentUserId)
    .flatMap((item) => {
      const filtered = Object.values(ctx.profiles)
        .filter((profile) => profile.userId === item.userId)
        .filter((profile) => profile.userId !== ctx.currentUserId);

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
        onClick={() => ctx.$push(['chat-new'])}
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
        <Header title="Chat" />

        {query.type === 'Loading' ? (
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
                    onClick={() =>
                      ctx.$push([
                        'chat-conversation',
                        { conversationId: item.conversationId },
                      ])
                    }
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
