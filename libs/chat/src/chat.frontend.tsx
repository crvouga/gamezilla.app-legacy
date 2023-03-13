import { Cmd, RemoteData } from '@gamezilla/core';
import { Ctx, SharedMsg } from '@gamezilla/shared';
import {
  Box,
  FillBox,
  Header,
  Icons,
  ViewLoadingState,
} from '@gamezilla/shared/ui';
import { Fab } from '@mui/material';
import { ToBackend, FrontendModel, FrontendMsg } from './chat.types';

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
  userSearch: '',
  requests: {},
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

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd: Cmd<Msg> } => {
  switch (msg[0]) {
    default: {
      return {
        model,
        cmd: Cmd.None,
      };
    }
  }
};

export const updateShared = ({
  msg,
  model,
  sendToBackend,
}: {
  msg: SharedMsg;
  model: Model;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg[0]) {
    case 'route-changed': {
      switch (msg[1].route[0]) {
        case 'chat-conversation': {
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
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: Ctx;
  route: 'chat' | 'chat-new' | 'chat-list';
}) => {
  switch (route) {
    case 'chat': {
      return <ViewChat model={model} $send={$send} />;
    }
    case 'chat-new': {
      return <ViewChatNew model={model} $send={$send} />;
    }
    case 'chat-list': {
      return <ViewChatList model={model} $send={$send} ctx={ctx} />;
    }
  }
};

const ViewChat = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <div>hello</div>;
};

const ViewChatNew = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <div>hello</div>;
};

const ViewChatList = ({
  model,
  // $send,
  ctx,
}: {
  ctx: Ctx;
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
