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
  WireStatus,
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
  LocalStorage,
  Option,
  p,
  Program,
  RemoteData,
  Sub,
  t,
} from '@gamezilla/core';
import { PartyFrontend as Party } from '@gamezilla/party';
import { ProfileStore } from '@gamezilla/profile';
import { RoomFrontend as GameRoom } from '@gamezilla/room';
import { Alerts, Route } from '@gamezilla/shared';
import * as UI from '@gamezilla/shared/ui';
import { Box, CircularProgress } from '@gamezilla/shared/ui';
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
      Option.withDefault<Route.Model>(['Home'])
    );
    const [auth, authCmd] = Auth.init();
    const alerts = Alerts.init;
    const chatStore = ChatStore.init;
    const [gameRoom, gameRoomCmd] = GameRoom.init;
    const [page, pageCmd] = Page.initLoading();
    const [party, partyCmd] = Party.init({
      sendToBackend: (msg) => sendToBackend(['Party', msg]),
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
        wire: 'Connecting',
      },
      Cmd.batch<Msg>([
        Route.replace(route),
        Cmd.tag('Auth', authCmd),
        Cmd.tag('Page', pageCmd),
        Cmd.tag('room', gameRoomCmd),
        Cmd.tag('Party', partyCmd),
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
  | GameRoom.Action
  | ChatStore.Action
  | Auth.Action
  | Party.Action
  | Route.Action
  | ProfileStore.Action;

const mapAction = <A, B>(
  mapper: (a: A) => B,
  action: OutAction<A>
): OutAction<B> => {
  if (action[0] === 'Alerts') {
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

      case 'Store': {
        const [storeNew, storeCmd] = ChatStore.update(msg[1], model.chatStore);

        return [{ ...model, chatStore: storeNew }, Cmd.tag('Store', storeCmd)];
      }

      case 'Auth': {
        const [authNew, authCmd] = Auth.update(
          { sendToBackend: (msg) => sendToBackend(['Auth', msg]) },
          msg[1],
          model.auth
        );

        return [{ ...model, auth: authNew }, Cmd.tag('Auth', authCmd)];
      }

      case 'Alerts': {
        const [alertsNew, alertsCmd, msgs] = Alerts.update(
          msg[1],
          model.alerts
        );

        return p(
          [{ ...model, alerts: alertsNew }, Cmd.tag('Alerts', alertsCmd)],
          andThenMany(update({ sendToBackend }), msgs)
        );
      }

      case 'Party': {
        const [child, childCmd] = Party.update(
          { sendToBackend: (msg) => sendToBackend(['Party', msg]) },
          msg[1],
          model.party
        );
        return [{ ...model, party: child }, Cmd.tag('Party', childCmd)];
      }

      case 'Route': {
        switch (msg[1][0]) {
          case 'GotRoute': {
            const modelNew: Model = {
              ...model,
              route: msg[1][1],
            };

            return initPage({ sendToBackend }, modelNew);
          }

          default: {
            return exhaustive(msg[1][0]);
          }
        }
      }

      case 'Wire': {
        return [{ ...model, wire: msg[1] }, Cmd.None];
      }

      case 'LocalStoragePut_Done': {
        return [model, Cmd.None];
      }

      case 'room': {
        const status = toStatus(model);

        if (status[0] !== 'Ready') {
          return [model, Cmd.None];
        }

        const { profile } = status[1];

        const [child, childCmd] = GameRoom.update(
          {
            ctx: {
              currentUserId: profile.userId,
              profiles: model.profileStore.profiles,
            },
            sendToBackend: (msg) => sendToBackend(['room', msg]),
          },
          msg[1],
          model.gameRoom
        );

        return [{ ...model, gameRoom: child }, Cmd.tag('room', childCmd)];
      }

      case 'Page': {
        const [modelNew, cmd, actions] = updatePage(msg[1], model);
        return p(
          [modelNew, cmd],
          andThenMany(runAction({ sendToBackend }), actions)
        );
      }

      case 'ProfileStore': {
        const [modelNew, cmd] = ProfileStore.update(msg[1], model.profileStore);
        return [
          { ...model, profileStore: modelNew },
          Cmd.tag('ProfileStore', cmd),
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
    case 'AuthLoading':
    case 'ProfileError':
    case 'ProfileLoading':
      return [model, Cmd.None, []];

    case 'LoggedOut': {
      const [pageNew, pageCmd, actions] = Page.updateLoggedOut(msg, model.page);

      return [{ ...model, page: pageNew }, Cmd.tag('Page', pageCmd), actions];
    }

    case 'ProfileMissing': {
      const [pageNew, pageCmd, actions] = Page.updateProfileMissing(
        status[1].authSession,
        msg,
        model.page
      );

      return [{ ...model, page: pageNew }, Cmd.tag('Page', pageCmd), actions];
    }

    case 'Ready': {
      const [pageNew, pageCmd, actions] = Page.updateReady(
        {
          ...model,
          profile: status[1].profile,
        },
        msg,
        model.page
      );
      return [{ ...model, page: pageNew }, Cmd.tag('Page', pageCmd), actions];
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
    case 'Session': {
      const sessionId = msg[1];

      return [
        model,
        LocalStorage.put(sessionIdKey, sessionId, t('LocalStoragePut_Done')),
      ];
    }

    case 'Party': {
      if (model.auth[0] !== 'LoggedIn') {
        return [model, Cmd.None];
      }

      const currentUserId = model.auth[1].userId;

      const [party, partyCmd, actions] = Party.updateFromBackend(
        { currentUserId },
        msg[1],
        model.party
      );

      return p(
        [{ ...model, party }, Cmd.tag('Party', partyCmd)],
        andThenMany(runAction({ sendToBackend }), actions)
      );
    }

    case 'room': {
      if (model.auth[0] !== 'LoggedIn') {
        return [model, Cmd.None];
      }

      const currentUserId = model.auth[1].userId;

      const [gameRoom, gameRoomCmd, actions] = GameRoom.updateFromBackend(
        {
          ctx: { currentUserId, profiles: model.profileStore.profiles },
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
    case 'ProfileError': {
      return [model, Cmd.None];
    }

    case 'AuthLoading': {
      return [model, Cmd.None];
    }

    case 'ProfileLoading': {
      const action: OutAction = [
        'Profile',
        ['FindMany', { userIds: [status[1].authSession.userId] }],
      ];

      return p(
        [model, Cmd.None],
        andThenMany(runAction({ sendToBackend }), [action])
      );
    }

    case 'ProfileMissing': {
      const [page, pageCmd] = Page.initProfileMissing(
        model.route,
        status[1].authSession
      );

      return [{ ...model, page }, Cmd.tag('Page', pageCmd)];
    }

    case 'LoggedOut': {
      const [page, pageCmd] = Page.initLoggedOut(model.page, model.route);
      return [{ ...model, page }, Cmd.tag('Page', pageCmd)];
    }

    case 'Ready': {
      const [page, pageCmd, actions] = Page.initReady(
        model.route,
        status[1].profile
      );
      return p(
        [{ ...model, page }, Cmd.tag('Page', pageCmd)],
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
      case 'Chat': {
        const [chatNew, chatCmd] = ChatStore.runAction(action, model.chatStore);
        return [{ ...model, chatStore: chatNew }, Cmd.tag('Store', chatCmd)];
      }

      case 'Alerts': {
        const [alertsNew, alertsCmd] = Alerts.runAction(action, model.alerts);
        return [{ ...model, alerts: alertsNew }, Cmd.tag('Alerts', alertsCmd)];
      }

      case 'room': {
        if (model.auth[0] !== 'LoggedIn') {
          return [model, Cmd.None];
        }

        const [gameRoom, gameRoomCmd] = GameRoom.runAction(
          {
            ctx: {
              currentUserId: model.auth[1].userId,
              profiles: model.profileStore.profiles,
            },
            sendToBackend: (msg) => sendToBackend(['room', msg]),
          },
          action,
          model.gameRoom
        );
        return [{ ...model, gameRoom }, Cmd.tag('room', gameRoomCmd)];
      }

      case 'Auth': {
        const [authNew, authCmd] = Auth.runAction(action, model.auth);
        return [{ ...model, auth: authNew }, Cmd.tag('Auth', authCmd)];
      }

      case 'Party': {
        const [party, partyCmd] = Party.runAction(
          { sendToBackend: (msg) => sendToBackend(['Party', msg]) },
          action,
          model.party
        );
        return [{ ...model, party }, Cmd.tag('Party', partyCmd)];
      }

      case 'Route': {
        const [route, routeCmd] = Route.runAction(action, model.route);

        return [{ ...model, route }, Cmd.tag('Route', routeCmd)];
      }

      case 'Profile': {
        const [profileStore, profileStoreCmd] = ProfileStore.runAction(
          action,
          model.profileStore
        );
        return [
          { ...model, profileStore },
          Cmd.tag('ProfileStore', profileStoreCmd),
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
    Sub.tag('Wire', wireStatus$),
    Sub.tag('→', toFrontend$),
    Browser.onLocation(onLocationChange),
    Sub.tag('Party', Party.subscriptions(model.party)),
    Sub.tag('Page', Page.subscriptions(model.page)),
    Sub.tag('Auth', Auth.subscriptions),
    gameRoomSub(model),
  ]);
};

const gameRoomSub = (model: Model): Sub<Msg> => {
  switch (model.auth[0]) {
    case 'Loading': {
      return Sub.None;
    }

    case 'LoggedOut': {
      return Sub.None;
    }

    case 'LoggedIn': {
      return Sub.tag(
        'room',
        GameRoom.subscriptions(
          { currentUserId: model.auth[1].userId },
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
    Option.withDefault<Route.Model>(['room']),
    (route) => ['Route', ['GotRoute', route]]
  );
};

//
//
//
// View
//
//
//

const toThemeMode = (model: Model): UI.ThemeMode => {
  const status = toStatus(model);

  switch (status[0]) {
    case 'AuthLoading':
    case 'LoggedOut':
    case 'ProfileLoading':
    case 'ProfileMissing':
    case 'ProfileError':
      return 'System';
    case 'Ready':
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
    <UI.AppContainer themeMode={toThemeMode(model)}>
      <ViewMain model={model} $send={$send} />

      <Alerts.View
        model={model.alerts}
        $send={(msg) => $send(['Alerts', msg])}
      />

      {model.wire === 'Connecting' && (
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
      )}
    </UI.AppContainer>
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
    case 'AuthLoading':
      return <ViewLoading reason="Authenticating..." />;

    case 'ProfileLoading':
      return <ViewLoading reason="Loading your profile..." />;

    case 'ProfileError':
      return <ViewError reason="Failed to load profile." />;

    case 'LoggedOut':
      return (
        <Page.ViewLoggedOut
          model={model.page}
          $send={(msg) => $send(['Page', msg])}
        />
      );

    case 'ProfileMissing':
      return (
        <Page.ViewProfileMissing
          authSession={status[1].authSession}
          model={model.page}
          $send={(msg) => $send(['Page', msg])}
        />
      );

    case 'Ready': {
      const { profile } = status[1];
      return (
        <>
          <Party.ViewBanner
            store={model.profileStore}
            currentUserId={profile.userId}
            model={model.party}
            route={model.route}
            $send={(msg) => $send(['Party', msg])}
          />

          <GameRoom.ViewBanner
            store={model.profileStore}
            currentUserId={profile.userId}
            model={model.gameRoom}
            route={model.route}
            $send={(msg) => $send(['room', msg])}
          />

          <Page.ViewReady
            {...model}
            ctx={{
              currentUserId: profile.userId,
              profiles: model.profileStore.profiles,
            }}
            profile={status[1].profile}
            $send={(msg) => $send(['Page', msg])}
            model={model.page}
          />
        </>
      );
    }
  }
};

const ViewLoading = (_props: { reason: string }) => (
  <UI.FillBox sx={{ justifyContent: 'center', alignItems: 'center' }}>
    <UI.CircularProgress sx={{ marginBottom: 2 }} />

    {/* <UI.Typography
      sx={{ position: 'absolute', bottom: 0, left: 0, padding: 1 }}
      align="center"
      variant="caption"
      color="text.secondary"
    >
      {reason}
    </UI.Typography> */}
  </UI.FillBox>
);

const ViewError = ({ reason }: { reason: string }) => (
  <UI.FillBox sx={{ justifyContent: 'center', alignItems: 'center', p: 2 }}>
    <UI.Alert severity="error">{reason}</UI.Alert>
  </UI.FillBox>
);

//
//
//
// Status
//
//
//

type Status =
  | ['AuthLoading']
  | ['LoggedOut']
  | ['ProfileLoading', { authSession: Auth.Session }]
  | ['ProfileMissing', { authSession: Auth.Session }]
  | ['ProfileError', { authSession: Auth.Session }]
  | ['Ready', { profile: ProfileStore.Profile; authSession: Auth.Session }];

const toStatus = ({
  auth,
  profileStore,
}: {
  profileStore: ProfileStore.Model;
  auth: Auth.Model;
}): Status => {
  switch (auth[0]) {
    case 'Loading':
      return ['AuthLoading'];

    case 'LoggedOut':
      return ['LoggedOut'];

    case 'LoggedIn': {
      const authSession = auth[1];

      const profile = profileStore.profiles[authSession.userId];

      if (profile) {
        return [
          'Ready',
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
          return ['ProfileLoading', { authSession }];

        case 'Loading':
          return ['ProfileLoading', { authSession }];

        case 'Err':
          return ['ProfileError', { authSession }];

        case 'Ok': {
          const userIds = query.value;

          const profiles = userIds
            .map((userId) => profileStore.profiles[userId])
            .flatMap((item) => (item ? [item] : []));

          const profile = profiles[0];

          if (!profile) {
            return ['ProfileMissing', { authSession }];
          }

          return [
            'Ready',
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

export const wireStatus$ = new Subject<WireStatus>();
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
        [sessionIdKey]:
          // localStorage.getItem(sessionIdKey) ?? undefined,
          '',
      },
      forceNew: true,
      closeOnBeforeunload: true,
    }
  );

  socketClient.on('connect', () => {
    wireStatus$.next('Connected');
  });

  socketClient.on('disconnect', () => {
    wireStatus$.next('Disconnected');
  });

  socketClient.on('ToFrontend', (msg) => {
    toFrontend$.next(msg);
  });

  const sendToBackend =
    (msg: ToBackend): Cmd =>
    () => {
      socketClient.emit('ToBackend', msg);
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
