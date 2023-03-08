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
import { PartyFrontend as Party } from '@gamezilla/party';
import { ProfileStore } from '@gamezilla/profile';
import { RoomFrontend as Room } from '@gamezilla/room';
import { Alerts, Ctx, Route } from '@gamezilla/shared';
import {
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

const init = ({
  sendToBackend,
  location,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
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
  const [gameRoom, roomCmd] = Room.init;
  const page = Page.initLoading();
  const [party, partyCmd] = Party.init({
    sendToBackend: (msg) => sendToBackend(['party', msg]),
  });
  const profileStore = ProfileStore.init;

  return {
    model: {
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
    cmd: Cmd.batch<Msg>([
      Route.replace(route),
      Cmd.tag('auth', authCmd),
      Cmd.tag('room', roomCmd),
      Cmd.tag('party', partyCmd),
    ]),
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

const update = ({
  sendToBackend,
  msg,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  const updated = update_({ sendToBackend, msg, model });

  const actions = updated.actions ?? [];

  if (
    updated.model.auth.type === 'logged-in' &&
    model.auth.type !== 'logged-in'
  ) {
    actions.push([
      'profile',
      ['find-many', { userIds: [updated.model.auth.session.userId] }],
    ]);
  }

  const didFetchCurrentUserProfile =
    updated.model.auth.type === 'logged-in' &&
    updated.model.profileStore.findMany[
      ProfileStore.toFindManyKey([updated.model.auth.session.userId])
    ]?.type !== 'Loading' &&
    model.profileStore.findMany[
      ProfileStore.toFindManyKey([updated.model.auth.session.userId])
    ]?.type === 'Loading';

  if (didFetchCurrentUserProfile) {
    //
    const updatedPage = initPage({
      model: updated.model,
    });

    const ranActions = [...(updatedPage.actions ?? []), ...actions].reduce(
      (acc, action) => {
        const ran = runAction({ sendToBackend, msg: action, model: acc.model });
        return {
          ...ran,
          cmd: Cmd.batch([acc.cmd, ran.cmd]),
        };
      },
      updatedPage
    );

    return ranActions;
  }
  const ranActions = actions.reduce((acc, action) => {
    const ran = runAction({ sendToBackend, msg: action, model: acc.model });
    return {
      ...ran,
      cmd: Cmd.batch([acc.cmd, ran.cmd]),
    };
  }, updated);

  return ranActions;
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

    case 'party': {
      const updated = Party.update(
        { sendToBackend: (msg) => sendToBackend(['party', msg]) },
        msg[1],
        model.party
      );
      return {
        model: { ...model, party: updated[0] },
        cmd: Cmd.tag('party', updated[1]),
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

      const updated = Room.update({
        ctx: ctx,
        sendToBackend: (m) => sendToBackend(['room', m]),
        msg: msg[1],
        model: model.gameRoom,
      });

      return {
        model: { ...model, gameRoom: updated.model },
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
            profileStore: model.profileStore,
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
    case 'party': {
      if (model.auth.type !== 'logged-in') {
        return { model };
      }

      const currentUserId = model.auth.session.userId;

      const updated = Party.updateFromBackend(
        { currentUserId },
        msg[1],
        model.party
      );

      return {
        model: { ...model, party: updated[0] },
        cmd: Cmd.tag('party', updated[1]),
        actions: updated[2],
      };
    }

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

      const updated = Room.updateFromBackend(
        {
          ctx,
          sendToBackend: (msg) => sendToBackend(['room', msg]),
        },
        msg[1],
        model.gameRoom
      );

      return {
        model: { ...model, gameRoom: updated[0] },
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
  sendToBackend,
  msg: action,
  model,
}: {
  msg: OutAction;
  model: Model;
  sendToBackend: (msg: ToBackend) => Cmd;
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

    case 'party': {
      const updated = Party.runAction(
        { sendToBackend: (msg) => sendToBackend(['party', msg]) },
        action,
        model.party
      );
      return {
        model: { ...model, party: updated[0] },
        cmd: Cmd.tag('party', updated[1]),
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

      {model.auth.type === 'logged-in' && (
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
      )}

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
      init: init({ sendToBackend, location: Browser.getLocation() }),
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
