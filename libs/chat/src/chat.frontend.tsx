import { Browser, Cmd, exhaustive, p, RemoteData } from '@gamezilla/core';
import { AppMsg, Route, ViewCtx } from '@gamezilla/shared';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FillBox,
  IconButton,
  Icons,
  InputAdornment,
  InputBase,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  TopBar,
  TopBarBackButton,
  Typography,
  ViewLoadingState,
  ViewNode,
} from '@gamezilla/shared/ui';
import { Fab } from '@mui/material';
import { matchSorter } from 'match-sorter';
import {
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from './chat.types';

//
//
//
// Model
//
//
//

export type Model = FrontendModel;

export const init: Model = {
  chats: {},
  chatsUsers: {},
  users: {},
  messageDrafts: {},
  messages: {},
  requests: {},
  userSearch: '',
  userSelected: {},
};

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg;

//
//
//
// Update
//
//
//

const userSearchInputId = 'user-search-input';

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case 'clicked-user-search-result': {
      return {
        model: {
          ...model,
          userSelected: toggleKey(model.userSelected, msg[1].userId),
          userSearch: '',
        },
      };
    }

    case 'clicked-user-selected-delete-button': {
      return {
        model: {
          ...model,
          userSelected: removeKey(model.userSelected, msg[1].userId),
        },
      };
    }

    case 'inputted-user-search': {
      return {
        model: {
          ...model,
          userSearch: msg[1].userSearch,
        },
      };
    }

    case 'clicked-user-search-clear-button': {
      return {
        model: {
          ...model,
          userSelected: {},
          userSearch: '',
        },
        cmd: p(
          Browser.focus(userSearchInputId),
          Cmd.perform((result) => ['focused', result])
        ),
      };
    }

    default: {
      return {
        model,
        cmd: Cmd.None,
      };
    }
  }
};

const toggleKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj };
  if (key in newObj) {
    delete newObj[key];
  } else {
    newObj[key] = key as T[keyof T];
  }
  return newObj;
};
const removeKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj };
  if (key in newObj) {
    delete newObj[key];
  }
  return newObj;
};

export const updateFromBackend = ({
  model,
}: {
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromApp = ({
  msg,
  model,
  sendToBackend,
}: {
  msg: AppMsg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case 'route-changed': {
      if (msg.route.t !== 'chat') {
        return { model };
      }

      switch (msg.route.c.t) {
        case 'chat-conversation': {
          return {
            model,
            cmd: sendToBackend(['chat-join', { chatId: 'todo' }]),
          };
        }

        case 'chat-new': {
          return {
            model,
            cmd: sendToBackend(['chat-join', { chatId: 'todo' }]),
          };
        }

        default: {
          return {
            model,
            cmd: sendToBackend(['chat-leave', { chatId: 'todo' }]),
          };
        }
      }
    }
    default: {
      return { model };
    }
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
  model,
  $send,
  ctx,
  route,
  userSearch,
  viewBottomBar,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: ViewCtx;
  route: Route.RouteChat;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
  viewBottomBar: ViewNode;
}) => {
  switch (route.t) {
    case 'chat-conversation': {
      return <ViewChat model={model} $send={$send} />;
    }

    case 'chat-new': {
      return (
        <ViewChatNew
          model={model}
          $send={$send}
          ctx={ctx}
          userSearch={userSearch}
        />
      );
    }

    case 'chat': {
      return (
        <>
          <ViewChatList model={model} $send={$send} ctx={ctx} />
          {viewBottomBar}
        </>
      );
    }

    default: {
      return exhaustive(route);
    }
  }
};

const ViewChat = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <FillBox>ViewChat</FillBox>;
};

const ViewChatNew = ({
  ctx,
  model,
  $send,
  userSearch,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
}) => {
  const profiles = matchSorter(Object.values(ctx.profiles), model.userSearch, {
    keys: ['name', 'username'],
  });
  return (
    <FillBox>
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: 'chat', c: { t: 'chat' } })}
          />
        }
        title="New Message"
        right={<Button sx={{ marginRight: -1 }}>Chat</Button>}
      />

      <Typography variant="h6" sx={{ fontWeight: 'bold', paddingX: 2 }}>
        To
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 2,
          paddingTop: 1,
          overflowX: 'scroll',
        }}
      >
        {Object.values(model.userSelected).map((userId) => {
          const profile = ctx.profiles[userId];
          if (!profile) {
            return null;
          }
          return (
            <Chip
              sx={{ marginLeft: 1 }}
              key={profile.userId}
              label={profile.username}
              onDelete={() => {
                $send([
                  'clicked-user-selected-delete-button',
                  {
                    userId: profile.userId,
                  },
                ]);
              }}
            />
          );
        })}
        <InputBase
          id={userSearchInputId}
          sx={{ paddingX: 2, flex: 1 }}
          autoFocus
          placeholder={
            Object.values(model.userSelected).length === 0 ? 'Search' : ''
          }
          value={model.userSearch}
          onChange={(event) => {
            const searchText = event.currentTarget.value;
            $send(['inputted-user-search', { userSearch: searchText }]);
            userSearch.onInput(searchText);
          }}
          endAdornment={
            <InputAdornment position="end">
              {userSearch.loading && <CircularProgress size={24} />}
              <IconButton
                onClick={() => {
                  $send(['clicked-user-search-clear-button']);
                }}
              >
                <Icons.Close />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>

      <Divider />

      <List sx={{ overflowY: 'scroll', flex: 1 }}>
        {profiles.map((profile) => {
          return (
            <ListItemButton
              key={profile.userId}
              onClick={() => {
                $send([
                  'clicked-user-search-result',
                  { userId: profile.userId },
                ]);
              }}
            >
              <ListItemAvatar>
                <Avatar src={profile.avatarUrl} />
              </ListItemAvatar>
              <ListItemText primary={profile.username} />
              <ListItemSecondaryAction>
                <Checkbox
                  checked={Boolean(model.userSelected[profile.userId])}
                />
              </ListItemSecondaryAction>
            </ListItemButton>
          );
        })}
      </List>
    </FillBox>
  );
};

const ViewChatList = ({
  model,
  // $send,
  ctx,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
}) => {
  const query = model.requests['chat-list'] ?? RemoteData.Loading;
  // const chats = Object.values(model.chats).filter((chat) => {
  //   const chatsUsersId = `${chat.chatId},${ctx.currentUserId}`;
  //   const chatsUsers = model.chatsUsers[chatsUsersId];

  //   return chatsUsers;
  // });

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
        onClick={() => ctx.$push({ t: 'chat', c: { t: 'chat-new' } })}
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

        {query.type === 'Loading' ? (
          <ViewLoadingState title="Loading conversations..." />
        ) : (
          <Box sx={{ flex: 1, overflowY: 'scroll' }}>
            {Object.values(model.chats).map((chat) => {
              const chatsUsersId = `${chat.chatId},${ctx.currentUserId}`;
              const chatsUsers = model.chatsUsers[chatsUsersId];
              if (!chatsUsers) {
                return null;
              }
              const profiles = Object.values(model.chatsUsers).flatMap(
                (item) => {
                  if (
                    item.chatId === chat.chatId &&
                    ctx.profiles[item.userId]
                  ) {
                    return [ctx.profiles[item.userId]];
                  }
                  return [];
                }
              );

              return (
                <Box>
                  {chat.chatId}
                  <pre>{JSON.stringify(profiles, null, 2)}</pre>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </FillBox>
  );
};
