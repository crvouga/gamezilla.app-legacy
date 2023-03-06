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
import { ChatStore } from '@gamezilla/chat';
import {
  andThen,
  andThenMany,
  Browser,
  Cmd,
  Debug,
  exhaustive,
  Option,
  p,
  Program,
  RemoteData,
  Sub,
  t,
} from '@gamezilla/core';
import { PartyFrontend as Party } from '@gamezilla/party';
import { ProfileStore } from '@gamezilla/profile';
import { RoomFrontend as Room } from '@gamezilla/room';
import { Alerts, Route } from '@gamezilla/shared';
import {
  Alert,
  AppContainer,
  Box,
  CircularProgress,
  Collapse,
  FillBox,
  ThemeMode,
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

const init =
  ({ sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd }) =>
  (location: Browser.Location): [Model, Cmd<Msg>] => {
    const route = p(
      location,
      Route.decode,
      Option.withDefault<Route.Model>(['room-list'])
    );
    const [auth, authCmd] = Auth.init();
    const alerts = Alerts.init;
    const chatStore = ChatStore.init;
    const [gameRoom, roomCmd] = Room.init;
    const page = Page.initLoading();
    const [party, partyCmd] = Party.init({
      sendToBackend: (msg) => sendToBackend(['party', msg]),
    });
    const profileStore = ProfileStore.init;

    return [
      {
        route,
        alerts,
        chatStore,
        gameRoom,
        auth,
        page,
        party,
        profileStore,
        wire: {
          type: 'connecting',
        },
      },
      Cmd.batch<Msg>([
        Route.replace(route),
        Cmd.tag('auth', authCmd),
        Cmd.tag('room', roomCmd),
        Cmd.tag('party', partyCmd),
      ]),
    ];
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
  | Room.Action
  | ChatStore.Action
  | Auth.Action
  | Party.Action
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

const update =
  (wire: { sendToBackend: (m: ToBackend) => Cmd }) =>
  (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    return p(
      [model, Cmd.None],
      andThen(updateMain(wire), msg),
      andThen(updateStatusChanged(wire, model), msg)
    );
  };

const updateMain =
  ({ sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd }) =>
  (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
      case '→': {
        return updateFromBackend({ sendToBackend }, msg[1], model);
      }

      case 'chat-store': {
        const [storeNew, storeCmd] = ChatStore.update(msg[1], model.chatStore);

        return [
          { ...model, chatStore: storeNew },
          Cmd.tag('chat-store', storeCmd),
        ];
      }

      case 'auth': {
        const [authNew, authCmd] = Auth.update(
          { sendToBackend: (msg) => sendToBackend(['auth', msg]) },
          msg[1],
          model.auth
        );

        return [{ ...model, auth: authNew }, Cmd.tag('auth', authCmd)];
      }

      case 'alerts': {
        const [alertsNew, alertsCmd, msgs] = Alerts.update(
          msg[1],
          model.alerts
        );

        return p(
          [{ ...model, alerts: alertsNew }, Cmd.tag('alerts', alertsCmd)],
          andThenMany(update({ sendToBackend }), msgs)
        );
      }

      case 'party': {
        const [child, childCmd] = Party.update(
          { sendToBackend: (msg) => sendToBackend(['party', msg]) },
          msg[1],
          model.party
        );
        return [{ ...model, party: child }, Cmd.tag('party', childCmd)];
      }

      case 'route': {
        const updated = Route.update({ msg: msg[1], model: model.route });
        const modelNew: Model = { ...model, route: updated.model };
        const initialize = initPage({ sendToBackend }, modelNew);
        return [
          initialize[0],
          Cmd.batch([initialize[1], Cmd.tag('route', updated.cmd)]),
        ];
      }

      case 'wire': {
        if (msg[1] === 'connect-error') {
          const wireNew: Model['wire'] = {
            type: 'connect-error',
            errorCount:
              model.wire.type === 'connect-error'
                ? model.wire.errorCount + 1
                : 1,
          };

          return [{ ...model, wire: wireNew }, Cmd.None];
        }
        return [{ ...model, wire: { type: msg[1] } }, Cmd.None];
      }

      case 'room': {
        const status = toStatus(model);

        if (status[0] !== 'ready') {
          return [model, Cmd.None];
        }

        const { profile } = status[1];

        const updated = Room.update({
          ctx: {
            currentUserId: profile.userId,
            profiles: model.profileStore.profiles,
            now: Date.now(),
            $push: () => {
              //
            },
          },
          sendToBackend: (m) => sendToBackend(['room', m]),
          msg: msg[1],
          model: model.gameRoom,
        });

        return [
          { ...model, gameRoom: updated.model },
          Cmd.tag('room', updated.cmd ?? Cmd.None),
        ];
      }

      case 'page': {
        const [modelNew, cmd, actions] = updatePage(msg[1], model);
        return p(
          [modelNew, cmd],
          andThenMany(runAction({ sendToBackend }), actions)
        );
      }

      case 'profile-store': {
        const [modelNew, cmd] = ProfileStore.update(msg[1], model.profileStore);
        return [
          { ...model, profileStore: modelNew },
          Cmd.tag('profile-store', cmd),
        ];
      }

      default:
        return exhaustive(msg);
    }
  };

const updatePage = (
  msg: Page.Msg,
  model: Model
): [Model, Cmd<Msg>, OutAction[]] => {
  const status = toStatus(model);

  switch (status[0]) {
    case 'auth-loading':
    case 'profile-error':
    case 'profile-loading':
      return [model, Cmd.None, []];

    case 'auth-missing': {
      const updated = Page.updateLoggedOut({
        msg: msg,
        model: model.page,
      });

      return [
        { ...model, page: updated.model },
        Cmd.tag('page', updated.cmd ?? Cmd.None),
        [],
      ];
    }

    case 'profile-missing': {
      const [pageNew, pageCmd, actions] = Page.updateProfileMissing(
        status[1].authSession,
        msg,
        model.page
      );

      return [{ ...model, page: pageNew }, Cmd.tag('page', pageCmd), actions];
    }

    case 'ready': {
      const [pageNew, pageCmd, actions] = Page.updateReady(
        {
          ...model,
          profile: status[1].profile,
        },
        msg,
        model.page
      );
      return [{ ...model, page: pageNew }, Cmd.tag('page', pageCmd), actions];
    }

    default:
      return exhaustive(status[0]);
  }
};

const updateFromBackend = (
  { sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd },
  msg: ToFrontend,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'party': {
      if (model.auth.type !== 'logged-in') {
        return [model, Cmd.None];
      }

      const currentUserId = model.auth.session.userId;

      const [party, partyCmd, actions] = Party.updateFromBackend(
        { currentUserId },
        msg[1],
        model.party
      );

      return p(
        [{ ...model, party }, Cmd.tag('party', partyCmd)],
        andThenMany(runAction({ sendToBackend }), actions)
      );
    }

    case 'room': {
      if (model.auth.type !== 'logged-in') {
        return [model, Cmd.None];
      }

      const currentUserId = model.auth.session.userId;

      const [gameRoom, gameRoomCmd, actions] = Room.updateFromBackend(
        {
          ctx: {
            currentUserId,
            profiles: model.profileStore.profiles,
            now: Date.now(),
            $push: () => {
              //
            },
          },
          sendToBackend: (msg) => sendToBackend(['room', msg]),
        },
        msg[1],
        model.gameRoom
      );

      return p(
        [{ ...model, gameRoom }, Cmd.tag('room', gameRoomCmd)],
        andThenMany(
          runAction({ sendToBackend }),
          actions.map((a) => mapAction(t('room'), a))
        )
      );
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

const initPage = (
  { sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd },
  model: Model
): [Model, Cmd<Msg>] => {
  const status = toStatus(model);

  switch (status[0]) {
    case 'profile-error': {
      return [model, Cmd.None];
    }

    case 'auth-loading': {
      return [model, Cmd.None];
    }

    case 'profile-loading': {
      const action: OutAction = [
        'profile',
        ['find-many', { userIds: [status[1].authSession.userId] }],
      ];

      return p(
        [model, Cmd.None],
        andThenMany(runAction({ sendToBackend }), [action])
      );
    }

    case 'profile-missing': {
      const [page, pageCmd] = Page.initProfileMissing(
        model.route,
        status[1].authSession
      );

      return [{ ...model, page }, Cmd.tag('page', pageCmd)];
    }

    case 'auth-missing': {
      const initial = Page.initLoggedOut({
        route: model.route,
        model: model.page,
      });
      return [
        { ...model, page: initial.model },
        Cmd.tag('page', initial.cmd ?? Cmd.None),
      ];
    }

    case 'ready': {
      const [page, pageCmd, actions] = Page.initReady(
        model.route,
        status[1].profile
      );
      return p(
        [{ ...model, page }, Cmd.tag('page', pageCmd)],
        andThenMany(runAction({ sendToBackend }), actions)
      );
    }

    default: {
      return exhaustive(status);
    }
  }
};

const updateStatusChanged =
  (wire: { sendToBackend: (m: ToBackend) => Cmd }, modelPrev: Model) =>
  (_msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    const statusPrev = toStatus(modelPrev);
    const statusNew = toStatus(model);

    if (statusNew[0] === statusPrev[0]) {
      return [model, Cmd.None];
    }

    return initPage(wire, model);
  };

const runAction =
  ({ sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd }) =>
  (action: OutAction, model: Model): [Model, Cmd<Msg>] => {
    switch (action[0]) {
      case 'chat': {
        const [chatNew, chatCmd] = ChatStore.runAction(action, model.chatStore);
        return [
          { ...model, chatStore: chatNew },
          Cmd.tag('chat-store', chatCmd),
        ];
      }

      case 'alerts': {
        const [alertsNew, alertsCmd] = Alerts.runAction(action, model.alerts);
        return [{ ...model, alerts: alertsNew }, Cmd.tag('alerts', alertsCmd)];
      }

      case 'room': {
        if (model.auth.type !== 'logged-in') {
          return [model, Cmd.None];
        }

        const updated = Room.runAction({
          ctx: {
            currentUserId: model.auth.session.userId,
            profiles: model.profileStore.profiles,
            now: Date.now(),
            $push: () => {
              //
            },
          },
          sendToBackend: (msg) => sendToBackend(['room', msg]),
          action,
          model: model.gameRoom,
        });
        return [
          { ...model, gameRoom: updated.model },
          Cmd.tag('room', updated.cmd ?? Cmd.None),
        ];
      }

      case 'auth': {
        const [authNew, authCmd] = Auth.runAction(action, model.auth);
        return [{ ...model, auth: authNew }, Cmd.tag('auth', authCmd)];
      }

      case 'party': {
        const [party, partyCmd] = Party.runAction(
          { sendToBackend: (msg) => sendToBackend(['party', msg]) },
          action,
          model.party
        );
        return [{ ...model, party }, Cmd.tag('party', partyCmd)];
      }

      case 'route': {
        const [route, routeCmd] = Route.runAction(action, model.route);

        return [{ ...model, route }, Cmd.tag('route', routeCmd)];
      }

      case 'profile': {
        const [profileStore, profileStoreCmd] = ProfileStore.runAction(
          action,
          model.profileStore
        );
        return [
          { ...model, profileStore },
          Cmd.tag('profile-store', profileStoreCmd),
        ];
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
    Sub.tag('wire', wireStatus$),
    Sub.tag('→', toFrontend$),
    Browser.onLocation(onLocationChange),
    Sub.tag('party', Party.subscriptions(model.party)),
    Sub.tag('page', Page.subscriptions(model.page)),
    Sub.tag('auth', Auth.subscriptions),
    gameRoomSub(model),
  ]);
};

const gameRoomSub = (model: Model): Sub<Msg> => {
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
        Room.subscriptions(
          {
            currentUserId: model.auth.session.userId,
            now: Date.now(),
            profiles: model.profileStore.profiles,
            $push: () => {
              //
            },
          },
          model.gameRoom
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

const toThemeMode = (model: Model): ThemeMode => {
  const status = toStatus(model);

  switch (status[0]) {
    case 'auth-loading':
    case 'auth-missing':
    case 'profile-loading':
    case 'profile-missing':
    case 'profile-error':
      return 'System';
    case 'ready':
      return status[1].profile.themeMode;
  }
};

const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <AppContainer themeMode={toThemeMode(model)}>
      <ViewMain model={model} $send={$send} />

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

const ViewMain = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const status = toStatus(model);

  switch (status[0]) {
    case 'auth-loading':
      return <ViewLoading reason="Authenticating..." />;

    case 'profile-loading':
      return <ViewLoading reason="Loading your profile..." />;

    case 'profile-error':
      return <ViewError reason="Failed to load profile." />;

    case 'auth-missing':
      return (
        <Page.ViewLoggedOut
          model={model.page}
          $send={(msg) => $send(['page', msg])}
        />
      );

    case 'profile-missing':
      return (
        <Page.ViewProfileMissing
          authSession={status[1].authSession}
          model={model.page}
          $send={(msg) => $send(['page', msg])}
        />
      );

    case 'ready': {
      const { profile } = status[1];
      return (
        <Page.ViewReady
          {...model}
          ctx={{
            currentUserId: profile.userId,
            profiles: model.profileStore.profiles,
            now: Date.now(),
            $push: (route) => $send(['route', ['clicked-link', route]]),
          }}
          profile={status[1].profile}
          $send={(msg) => $send(['page', msg])}
          $sendRoom={(msg) => $send(['room', msg])}
          model={model.page}
        />
      );
    }
  }
};

const ViewLoading = (_props: { reason: string }) => (
  <FillBox sx={{ justifyContent: 'center', alignItems: 'center' }}>
    <CircularProgress sx={{ marginBottom: 2 }} />
  </FillBox>
);

const ViewError = ({ reason }: { reason: string }) => (
  <FillBox sx={{ justifyContent: 'center', alignItems: 'center', p: 2 }}>
    <Alert severity="error">{reason}</Alert>
  </FillBox>
);

//
//
//
// Status
//
//
//

type Status =
  | ['auth-loading']
  | ['auth-missing']
  | ['profile-loading', { authSession: Auth.Session }]
  | ['profile-missing', { authSession: Auth.Session }]
  | ['profile-error', { authSession: Auth.Session }]
  | ['ready', { profile: ProfileStore.Profile; authSession: Auth.Session }];

const toStatus = ({
  auth,
  profileStore,
}: {
  profileStore: ProfileStore.Model;
  auth: Auth.Model;
}): Status => {
  switch (auth.type) {
    case 'loading':
      return ['auth-loading'];

    case 'logged-out':
      return ['auth-missing'];

    case 'logged-in': {
      const authSession = auth.session;

      const profile = profileStore.profiles[authSession.userId];

      if (profile) {
        return [
          'ready',
          {
            authSession,
            profile,
          },
        ];
      }

      const key = ProfileStore.toFindManyKey([authSession.userId]);

      const query = profileStore.findMany[key] ?? RemoteData.NotAsked;

      switch (query.type) {
        case 'NotAsked':
          return ['profile-loading', { authSession }];

        case 'Loading':
          return ['profile-loading', { authSession }];

        case 'Err':
          return ['profile-error', { authSession }];

        case 'Ok': {
          const userIds = query.value;

          const profiles = userIds
            .map((userId) => profileStore.profiles[userId])
            .flatMap((item) => (item ? [item] : []));

          const profile = profiles[0];

          if (!profile) {
            return ['profile-missing', { authSession }];
          }

          return [
            'ready',
            {
              authSession,
              profile,
            },
          ];
        }
      }
    }
  }
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
      init: init({ sendToBackend })(Browser.getLocation()),
      subscriptions,
      update: update({ sendToBackend }),
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
