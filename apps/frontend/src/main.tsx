import {
  backendServerPort,
  ClientToServerEvents,
  FrontendModel,
  FrontendMsg,
  Page,
  ServerToClientEvents,
  sessionIdKey,
  ToBackend,
  ToFrontend,
} from '@gamezilla/app';
import { Auth } from '@gamezilla/auth';
import { ChatFrontend, ChatStore } from '@gamezilla/chat';
import {
  andThen,
  Browser,
  Cmd,
  Debug,
  exhaustive,
  Option,
  p,
  Program,
  Sub,
  t,
} from '@gamezilla/core';
import { ProfileStore } from '@gamezilla/profile';
import { RoomFrontend } from '@gamezilla/room';
import {
  Alerts,
  Ctx,
  ProfileAvatar,
  Route,
  SharedMsg,
  Username,
} from '@gamezilla/shared';
import {
  AppContainer,
  Box,
  ButtonBase,
  CircularProgress,
  Collapse,
  FillBox,
  Icons,
  ThemeMode,
  Typography,
  useTheme,
  ViewNode,
} from '@gamezilla/shared/ui';
import * as ReactDOM from 'react-dom/client';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

//
//
//
// Model
//
//
//

type Model = FrontendModel;

const init = ({
  location,
}: {
  location: Browser.Location;
}): {
  model: Model;
  cmd: Cmd<Msg>;
} => {
  const route = p(
    location,
    Route.decode,
    Option.withDefault<Route.Model>(['room-list'])
  );
  const [auth, authCmd] = Auth.init();
  const alerts = Alerts.init;
  const chatStore = ChatStore.init;
  const room = RoomFrontend.init;
  const page = Page.initLoading();

  const profileStore = ProfileStore.init;
  const chat = ChatFrontend.init;

  return {
    model: {
      route,
      chat,
      alerts,
      chatStore,
      room,
      auth,
      page,
      profileStore,
      wire: {
        type: 'connecting',
      },
    },
    cmd: Cmd.batch<Msg>([Route.replace(route), Cmd.tag('auth', authCmd)]),
  };
};

//
//
//
// Msg
//
//
//

type Msg = FrontendMsg;

type OutAction<Msg = FrontendMsg> =
  | Alerts.Action<Msg>
  | ChatStore.Action
  | Auth.Action
  | Route.Action
  | ProfileStore.Action;

const mapAction = <A, B>(
  mapper: (a: A) => B,
  action: OutAction<A>
): OutAction<B> => {
  if (action[0] === 'alerts') {
    return Alerts.mapAction(mapper, action);
  }
  return action;
};

//
//
//
// Update
//
//
//

const update = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return p(
    { model },
    andThen((input) => update_({ ...input, msg, sendToBackend })),
    andThen((input) => updateFetchProfile({ ...input, prev: model })),
    andThen((input) => updateInitPage({ ...input, prev: model })),
    andThen((input) => updateAutoCreateProfile({ ...input, prev: model })),
    andThen((input) => updateInitPageAuthChanged({ ...input, prev: model })),
    (output) => {
      return output.actions.reduce(
        (acc, action) => {
          const ran = runAction({
            msg: action,
            model: acc.model,
          });
          return {
            ...ran,
            cmd: Cmd.batch([acc.cmd, ran.cmd]),
          };
        },
        {
          model: output.model,
          cmd: output.cmd,
        }
      );
    }
  );
};

const updateAutoCreateProfile = ({
  model,
  prev,
}: {
  prev: Model;
  model: Model;
}): { model: Model; actions?: OutAction[] } => {
  if (model.auth.type !== 'logged-in') {
    return { model };
  }

  const key = ProfileStore.toFindManyKey([model.auth.session.userId]);

  const findMany = model.profileStore.findMany[key];
  const findManyPrev = prev.profileStore.findMany[key];
  if (
    findManyPrev?.type !== 'Ok' &&
    findMany?.type === 'Ok' &&
    findMany.value.length === 0
  ) {
    const username = Username.generate('-');

    return {
      model,
      actions: [
        [
          'profile',
          [
            'create-one',
            {
              profile: {
                userId: model.auth.session.userId,
                avatarUrl: ProfileAvatar.toUrl({
                  seed: ProfileAvatar.toSeed(username),
                  style: 'adventurer-neutral',
                }),
                name: '',
                themeMode: 'System',
                username: username,
              },
            },
          ],
        ],
      ],
    };
  }
  return { model };
};

const updateInitPage = ({
  model,
  prev,
}: {
  prev: Model;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (model.auth.type !== 'logged-in') {
    return { model };
  }

  const key = ProfileStore.toFindManyKey([model.auth.session.userId]);

  if (
    !prev.profileStore.profiles[model.auth.session.userId] &&
    model.profileStore.profiles[model.auth.session.userId] &&
    model.profileStore.findMany[key]?.type === 'Ok'
  ) {
    return initPage({ model });
  }
  return { model };
};

const updateInitPageAuthChanged = ({
  model,
  prev,
}: {
  prev: Model;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  if (prev.auth.type !== model.auth.type) {
    return initPage({ model });
  }
  return { model };
};

const updateFetchProfile = ({
  prev,
  model,
}: {
  prev: Model;
  model: Model;
}): { model: Model; actions?: OutAction[] } => {
  if (model.auth.type === 'logged-in' && prev.auth.type !== 'logged-in') {
    return {
      model,
      actions: [
        ['profile', ['find-many', { userIds: [model.auth.session.userId] }]],
      ],
    };
  }
  return { model };
};

export const updateShared = ({
  model,
  msg,
}: {
  model: Model;
  msg: SharedMsg;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const chat = ChatFrontend.updateShared({
    model: ChatFrontend.init,
    msg,
    sendToBackend: (m) => () => {
      console.log('todo send to backend', m);
    },
  });
  return {
    model: {
      ...model,
      chat: chat.model,
    },
    cmd: Cmd.batch([
      //
      Cmd.tag('chat', chat.cmd ?? Cmd.None),
    ]),
  };
};

const update_ = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg[0]) {
    case '→': {
      return updateFromBackend({ sendToBackend, msg: msg[1], model });
    }

    case 'chat-store': {
      const updated = ChatStore.update(msg[1], model.chatStore);
      return {
        model: { ...model, chatStore: updated[0] },
        cmd: Cmd.tag('chat-store', updated[1]),
      };
    }

    case 'auth': {
      const updated = Auth.update(
        { sendToBackend: (msg) => sendToBackend(['auth', msg]) },
        msg[1],
        model.auth
      );
      return {
        model: { ...model, auth: updated[0] },
        cmd: Cmd.tag('auth', updated[1]),
      };
    }

    case 'alerts': {
      const updatedAlerts = Alerts.update(msg[1], model.alerts);
      const updated = updatedAlerts[2].reduce<ReturnType<typeof update>>(
        (acc, msg) => {
          const updated = update({ sendToBackend, msg, model: acc.model });
          return {
            model: updated.model,
            cmd: Cmd.batch([acc?.cmd ?? Cmd.None, updated?.cmd ?? Cmd.None]),
          };
        },
        {
          model: { ...model, alerts: updatedAlerts[0] },
          cmd: Cmd.tag('alerts', updatedAlerts[1]),
        }
      );

      return {
        model: updated.model,
        cmd: updated.cmd,
        actions: [],
      };
    }

    case 'route': {
      const updated = Route.update({
        msg: msg[1],
        model: model.route,
      });
      const updatedPage = initPage({
        model: { ...model, route: updated.model },
      });
      return {
        model: updatedPage.model,
        cmd: Cmd.batch([
          Cmd.tag('route', updated.cmd),
          updatedPage.cmd ?? Cmd.None,
        ]),
        actions: updatedPage.actions,
      };
    }

    case 'wire': {
      if (msg[1] === 'connect-error') {
        return {
          model: {
            ...model,
            wire: {
              type: 'connect-error',
              errorCount:
                model.wire.type === 'connect-error'
                  ? model.wire.errorCount + 1
                  : 1,
            },
          },
        };
      }
      return { model: { ...model, wire: { type: msg[1] } } };
    }

    case 'room': {
      if (model.auth.type !== 'logged-in') {
        return { model };
      }

      const ctx: Ctx = {
        currentUserId: model.auth.session.userId,
        profiles: model.profileStore.profiles,
        now: Date.now(),
        $push: () => {
          /* */
        },
      };

      const updated = RoomFrontend.update({
        ctx: ctx,
        sendToBackend: (m) => sendToBackend(['room', m]),
        msg: msg[1],
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag('room', updated.cmd ?? Cmd.None),
      };
    }

    case 'page': {
      switch (model.auth.type) {
        case 'loading':
          return { model };

        case 'logged-out': {
          const updated = Page.updateLoggedOut({
            msg: msg[1],
            model: model.page,
          });

          return {
            model: { ...model, page: updated.model },
            cmd: Cmd.tag('page', updated.cmd ?? Cmd.None),
          };
        }

        case 'logged-in': {
          const updated = Page.updateReady({
            currentUserId: model.auth.session.userId,
            msg: msg[1],
            model: model.page,
          });
          return {
            model: { ...model, page: updated[0] },
            cmd: Cmd.tag('page', updated[1]),
            actions: updated[2],
          };
        }
        default: {
          return exhaustive(model.auth);
        }
      }
    }

    case 'profile-store': {
      const updated = ProfileStore.update(msg[1], model.profileStore);
      return {
        model: { ...model, profileStore: updated[0] },
        cmd: Cmd.tag('profile-store', updated[1]),
      };
    }

    case 'chat': {
      const updated = ChatFrontend.update({ msg: msg[1], model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag('chat', updated?.cmd ?? Cmd.None),
      };
    }

    default:
      return exhaustive(msg);
  }
};

const updateFromBackend = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: ToFrontend;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg[0]) {
    case 'room': {
      if (model.auth.type !== 'logged-in') {
        return { model };
      }

      const currentUserId = model.auth.session.userId;

      const ctx: Ctx = {
        currentUserId,
        profiles: model.profileStore.profiles,
        now: Date.now(),
        $push: () => {
          /* */
        },
      };

      const updated = RoomFrontend.updateFromBackend(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(['room', msg]),
        },
        msg[1],
        model.room
      );

      return {
        model: { ...model, room: updated[0] },
        cmd: Cmd.tag('room', updated[1] ?? Cmd.None),
        actions: updated[2].map((a) => mapAction(t('room'), a)),
      };
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const initPage = ({
  model,
}: {
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (model.auth.type) {
    case 'loading': {
      return { model };
    }

    case 'logged-out': {
      const initial = Page.initLoggedOut({
        route: model.route,
        model: model.page,
      });
      return {
        model: { ...model, page: initial.model },
        cmd: Cmd.tag('page', initial.cmd ?? Cmd.None),
      };
    }

    case 'logged-in': {
      if (
        ['chat-conversation', 'chat-list', 'chat-new'].includes(model.route[0])
      ) {
        return { model };
      }

      const initial = Page.initReady({
        currentUserId: model.auth.session.userId,
        profileStore: model.profileStore,
        route: model.route,
      });
      return {
        model: { ...model, page: initial[0] },
        cmd: Cmd.tag('page', initial[1]),
        actions: initial[2],
      };
    }
  }
};

const runAction = ({
  msg: action,
  model,
}: {
  msg: OutAction;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (action[0]) {
    case 'chat': {
      const updated = ChatStore.runAction(action, model.chatStore);
      return {
        model: { ...model, chatStore: updated[0] },
        cmd: Cmd.tag('chat-store', updated[1]),
      };
    }

    case 'alerts': {
      const updated = Alerts.runAction(action, model.alerts);
      return {
        model: { ...model, alerts: updated[0] },
        cmd: Cmd.tag('alerts', updated[1]),
      };
    }

    case 'auth': {
      const updated = Auth.runAction(action, model.auth);
      return {
        model: { ...model, auth: updated[0] },
        cmd: Cmd.tag('auth', updated[1]),
      };
    }

    case 'route': {
      const updated = Route.runAction(action, model.route);

      return {
        model: { ...model, route: updated[0] },
        cmd: Cmd.tag('route', updated[1]),
      };
    }

    case 'profile': {
      const updated = ProfileStore.runAction(action, model.profileStore);
      return {
        model: { ...model, profileStore: updated[0] },
        cmd: Cmd.tag('profile-store', updated[1]),
      };
    }

    default:
      return exhaustive(action[0]);
  }
};

//
//
//
// Subscriptions
//
//
//

const subscriptions = (model: Model): Sub<Msg> => {
  return Sub.batch<Msg>([
    Sub.tag('→', toFrontend$),
    Sub.tag('wire', wireStatus$),
    Sub.tag('page', Page.subscriptions(model.page)),
    Sub.tag('auth', Auth.subscriptions),
    roomSub(model),
    Browser.onLocation(onLocationChange),
  ]);
};

const roomSub = (model: Model): Sub<Msg> => {
  switch (model.auth.type) {
    case 'loading': {
      return Sub.None;
    }

    case 'logged-out': {
      return Sub.None;
    }

    case 'logged-in': {
      return Sub.tag(
        'room',
        RoomFrontend.subscriptions(
          {
            currentUserId: model.auth.session.userId,
            now: Date.now(),
            profiles: model.profileStore.profiles,
            $push: () => {
              //
            },
          },
          model.room
        )
      );
    }
  }
};

const onLocationChange = (location: Browser.Location): Msg => {
  return p(
    location,
    Route.decode,
    Option.withDefault<Route.Model>(['room-list']),
    (route) => ['route', ['got-route', route]]
  );
};

//
//
//
// View
//
//
//

const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <AppContainer themeMode={toThemeMode(model)}>
      {model.auth.type === 'loading' && (
        <FillBox sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ marginBottom: 2 }} />
        </FillBox>
      )}

      {model.auth.type === 'logged-out' && (
        <Page.ViewLoggedOut
          $send={(m) => $send(['page', m])}
          model={model.page}
        />
      )}

      {model.auth.type === 'logged-in' &&
        (['chat-conversation', 'chat-new', 'chat-list'].includes(
          model.route[0]
        ) ? (
          <>
            <ChatFrontend.View
              $send={(m) => $send(['chat', m])}
              model={model.chat}
              ctx={{
                currentUserId: model.auth.session.userId,
                profiles: model.profileStore.profiles,
                now: Date.now(),
                $push: (route) => $send(['route', ['clicked-link', route]]),
              }}
              route={model.route}
              userSearch={{
                loading:
                  model.profileStore.search[model.chat.userSearch]?.type ===
                  'Loading',
                onInput: (searchText) => {
                  $send(['profile-store', ['search', { searchText }]]);
                },
              }}
            />
            <ViewBottomBar
              $send={$send}
              model={model}
              ctx={{
                currentUserId: model.auth.session.userId,
                profiles: model.profileStore.profiles,
                now: Date.now(),
                $push: (route) => $send(['route', ['clicked-link', route]]),
              }}
            />
          </>
        ) : (
          <Page.ViewReady
            {...model}
            ctx={{
              currentUserId: model.auth.session.userId,
              profiles: model.profileStore.profiles,
              now: Date.now(),
              $push: (route) => $send(['route', ['clicked-link', route]]),
            }}
            $send={(msg) => $send(['page', msg])}
            $sendRoom={(msg) => $send(['room', msg])}
            model={model.page}
          />
        ))}

      <Alerts.View
        model={model.alerts}
        $send={(msg) => $send(['alerts', msg])}
      />

      <Collapse
        in={model.wire.type === 'connect-error' && model.wire.errorCount > 2}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            backgroundColor: 'primary.main',
            // animation: `${flicker} 0.5s infinite ease`,
          }}
        >
          <CircularProgress
            size="1rem"
            sx={{ color: '#fff', marginRight: 1 }}
          />
          Connecting to backend...
        </Box>
      </Collapse>
    </AppContainer>
  );
};

const toThemeMode = (model: Model): ThemeMode => {
  switch (model.auth.type) {
    case 'loading':
    case 'logged-out': {
      return 'System';
    }
    case 'logged-in': {
      const profile = model.profileStore.profiles[model.auth.session.userId];
      if (!profile) {
        return 'System';
      }
      return profile.themeMode;
    }
  }
};

const ViewBottomBar = ({
  ctx,
  model,
  $send,
}: {
  ctx: Ctx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RoomFrontend.ViewBar
        ctx={ctx}
        model={model.room}
        $send={(m) => $send(['room', m])}
      />
      <ViewBottomNavigation ctx={ctx} route={model.route} />
    </Box>
  );
};

const ViewBottomNavigation = ({
  route,
  ctx,
}: {
  ctx: Ctx;
  route: Route.Model;
}) => {
  const items: {
    route: Route.Model;
    label: string;
    filled: ViewNode;
    outlined: ViewNode;
  }[] = [
    {
      route: ['room-list'],
      label: 'Rooms',
      filled: <Icons.SportsEsports />,
      outlined: <Icons.SportsEsportsOutlined />,
    },
    // {
    //   route: ['party'],
    //   filled: <Icons.Group />,
    //   outlined: <Icons.GroupOutlined />,
    // },
    {
      route: ['search'],
      label: 'Search',
      filled: <Icons.Search />,
      outlined: <Icons.SearchOutlined />,
    },
    {
      route: ['chat-list'],
      label: 'Chat',
      filled: <Icons.Chat />,
      outlined: <Icons.ChatOutlined />,
    },
    {
      route: ['profile', { userId: ctx.currentUserId }],
      label: 'Profile',
      filled: <Icons.AccountCircle />,
      outlined: <Icons.AccountCircleOutlined />,
    },
  ];

  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderTop: `1.5px solid ${theme.palette.divider}`,
      }}
    >
      {items.map((item) => {
        const isSelected = Route.equals(route, item.route);

        return (
          <ButtonBase
            key={Route.encode(item.route)}
            onClick={() => ctx.$push(item.route)}
            sx={{
              color: isSelected ? 'primary.main' : 'text.secondary',
              paddingY: 0,
              paddingX: 2,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
            }}
          >
            {isSelected ? item.filled : item.outlined}
            <Typography variant="caption">{item.label}</Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

//
//
//
// Socket
//
//
//

export const wireStatus$ = new Subject<Model['wire']['type']>();
export const toFrontend$ = new Subject<ToFrontend>();

//
//
//
// Main
//
//
//

const main = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  const backendUrl = isProduction
    ? 'https://backend.gamezilla.app/'
    : `http://localhost:${backendServerPort}/`;

  const socketClient: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    backendUrl,
    {
      auth: {
        [sessionIdKey]: localStorage.getItem(sessionIdKey) ?? undefined,
      },
    }
  );

  socketClient.on('session-id', (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(sessionIdKey, sessionId);
  });

  socketClient.on('connect', () => {
    wireStatus$.next('connected');
  });

  socketClient.on('disconnect', () => {
    wireStatus$.next('disconnected');
  });

  socketClient.on('connect_error', () => {
    wireStatus$.next('connect-error');
  });

  socketClient.on('to-frontend', (msg) => {
    toFrontend$.next(msg);
  });

  const sendToBackend =
    (msg: ToBackend): Cmd =>
    () => {
      socketClient.emit('to-backend', msg);
    };

  const { program } = p(
    Program.create({
      init: init({ location: Browser.getLocation() }),
      update: (input) => update({ ...input, sendToBackend }),
      subscriptions,
    }),
    Debug.ReduxDevTools.withDebugger
  );

  Program.run(program);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  program.state$.subscribe(({ model }) => {
    root.render(<View model={model} $send={program.$send} />);
  });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (import.meta.hot) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!import.meta.hot.data?.['started']) {
    console.log('[hot] starting app');
    main();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.hot.data['started'] = true;
  } else {
    console.log('[hot] reload');
  }
} else {
  main();
}
