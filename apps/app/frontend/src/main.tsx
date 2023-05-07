import {
  backendServerPort,
  ClientToServerEvents,
  FrontendModel,
  FrontendMsg,
  ServerToClientEvents,
  sessionIdKey,
  ToBackend,
  ToFrontend,
} from '@gamezilla/app';
import { AuthFrontend } from '@gamezilla/feat/auth';
import { ChatFrontend } from '@gamezilla/feat/chat';
import { ProfileFrontend } from '@gamezilla/feat/profile';
import { RoomFrontend } from '@gamezilla/feat/room';
import { SearchFrontend } from '@gamezilla/feat/search';
import {
  AppMsg,
  Ctx,
  Route,
  UnauthenticatedViewCtx,
  ViewCtx,
} from '@gamezilla/shared';
import {
  andThen,
  Browser,
  Cmd,
  Debug,
  exhaustive,
  p,
  Posix,
  Program,
  Sub,
} from '@gamezilla/shared/core';
import { Alerts } from '@gamezilla/shared/frontend';
import {
  cn,
  IconGamepad,
  IconMagnifyingGlass,
  IconSpinner,
  IconUserCircle,
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
    location.pathname,
    Route.decode,
    (route): Route.Route =>
      route ? route : { t: 'room', c: { t: 'room-list' } }
  );
  const auth = AuthFrontend.init();
  const alerts = Alerts.init;
  const room = RoomFrontend.init();
  const profile = ProfileFrontend.init;
  const chat = ChatFrontend.init;
  const search = SearchFrontend.init;

  return {
    model: {
      route,
      chat,
      alerts,
      room: room.model,
      auth: auth.model,
      search: search.model,
      profile,
      wire: {
        type: 'connecting',
      },
    },
    cmd: Cmd.batch<Msg>([Route.replace(route), Cmd.tag_('auth', auth.cmd)]),
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

type OutAction<Msg = FrontendMsg> = Alerts.Action<Msg>;

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
  now,
}: {
  now: Posix;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return p(
    { model },
    andThen((input) => update_({ ...input, now, msg, sendToBackend })),
    andThen((input) => {
      if (
        msg.t === 'auth' &&
        msg.c.t === 'got-current-user' &&
        msg.c.currentUser.t === 'logged-in'
      ) {
        const updated = updateFromApp({
          model: input.model,
          sendToBackend,
          msg: {
            t: 'user-logged-in',
            currentUserId: msg.c.currentUser.currentUserId,
          },
        });
        return {
          model: updated.model,
          cmd: updated.cmd,
        };
      }
      return { model: input.model };
    }),

    (output) => {
      return {
        model: output.model,
        cmd: output.cmd,
      };
    }
  );
};

const update_ = ({
  sendToBackend,
  msg,
  model,
  now,
}: {
  now: Posix;
  sendToBackend: (m: ToBackend) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg.t) {
    case '→': {
      return updateFromBackend({ now, sendToBackend, msg: msg.c, model });
    }

    case 'auth': {
      const updated = AuthFrontend.update({
        route: model.route,
        sendToBackend: (c) => sendToBackend({ t: 'auth', c }),
        msg: msg.c,
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.tag_('auth', updated.cmd),
      };
    }

    case 'alerts': {
      const updatedAlerts = Alerts.update(msg.c, model.alerts);
      const updated = updatedAlerts[2].reduce<ReturnType<typeof update>>(
        (acc, msg) => {
          const updated = update({
            now,
            sendToBackend,
            msg,
            model: acc.model,
          });
          return {
            model: updated.model,
            cmd: Cmd.batch([acc?.cmd ?? Cmd.None, updated?.cmd ?? Cmd.None]),
          };
        },
        {
          model: { ...model, alerts: updatedAlerts[0] },
          cmd: Cmd.tag_('alerts', updatedAlerts[1]),
        }
      );

      return {
        model: updated.model,
        cmd: updated.cmd,
        actions: [],
      };
    }

    case 'route': {
      const routeUpdated = Route.update({
        msg: msg.c,
        model: model.route,
      });

      const updated: Model = {
        ...model,
        route: routeUpdated.model,
      };

      const appUpdated = updateFromApp({
        msg: { t: 'route-changed', route: updated.route },
        model: updated,
        sendToBackend,
      });
      return {
        model: appUpdated.model,
        cmd: Cmd.batch([Cmd.tag_('route', routeUpdated.cmd), appUpdated.cmd]),
      };
    }

    case 'wire': {
      if (msg.wire === 'connect-error') {
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

      if (msg.wire === 'connected') {
        const roomUpdated = RoomFrontend.updateFromApp({
          msg: { t: 'wire-connected' },
          model: model.room,
          sendToBackend: (m) => sendToBackend({ t: 'room', c: m }),
        });
        return {
          model: {
            ...model,
            room: roomUpdated.model,
            wire: { type: msg.wire },
          },
          cmd: Cmd.tag_('room', roomUpdated.cmd ?? Cmd.None),
        };
      }

      return { model: { ...model, wire: { type: msg.wire } } };
    }

    case 'room': {
      if (model.auth.currentUser.t !== 'logged-in') {
        return { model };
      }

      const ctx: Ctx = {
        currentUserId: model.auth.currentUser.currentUserId,
        profiles: model.profile.profiles,
        now,
      };

      const updated = RoomFrontend.update({
        ctx: ctx,
        sendToBackend: (m) => sendToBackend({ t: 'room', c: m }),
        msg: msg.c,
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_('room', updated.cmd ?? Cmd.None),
      };
    }

    case 'profile': {
      const updated = ProfileFrontend.update({
        msg: msg.c,
        model: model.profile,
        sendToBackend: (m) => sendToBackend({ t: 'profile', c: m }),
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_('profile', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatFrontend.update({ msg: msg.c, model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_('chat', updated?.cmd ?? Cmd.None),
      };
    }

    case 'search': {
      const updated = SearchFrontend.update({
        msg: msg.c,
        model: model.search,
        sendToBackend: (m) => sendToBackend({ t: 'search', c: m }),
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
      };
    }

    default: {
      return exhaustive(msg);
    }
  }
};

const updateFromBackend = ({
  sendToBackend,
  msg,
  now,
  model,
}: {
  sendToBackend: (m: ToBackend) => Cmd;
  msg: ToFrontend;
  model: Model;
  now: Posix;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg.t) {
    case 'room': {
      if (model.auth.currentUser.t !== 'logged-in') {
        return { model };
      }

      const currentUserId = model.auth.currentUser.currentUserId;

      const ctx: Ctx = {
        currentUserId,
        profiles: model.profile.profiles,
        now,
      };

      const updated = RoomFrontend.updateFromBackend({
        ctx,
        sendToBackend: (msg) => sendToBackend({ t: 'room', c: msg }),
        msg: msg.c,
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_('room', updated.cmd ?? Cmd.None),
        actions: [],
      };
    }

    case 'profile': {
      const updated = ProfileFrontend.updateFromBackend({
        msg: msg.c,
        model: model.profile,
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_('profile', updated.cmd),
        actions: [],
      };
    }

    case 'search': {
      const updated = SearchFrontend.updateFromBackend({
        msg: msg.c,
        model: model.search,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_('search', updated.cmd),
        actions: [],
      };
    }

    case 'auth': {
      const updated = AuthFrontend.updateFromBackend({
        msg: msg.c,
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.tag_('auth', updated.cmd),
        actions: [],
      };
    }

    case 'chat': {
      const updated = ChatFrontend.updateFromBackend({
        msg: msg.c,
        model: model.chat,
      });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_('chat', updated.cmd),
        actions: [],
      };
    }

    case 'access-denied': {
      return { model };
    }

    default: {
      return exhaustive(msg);
    }
  }
};

export const updateFromApp = ({
  model,
  msg,
  sendToBackend,
}: {
  model: Model;
  msg: AppMsg;
  sendToBackend: (m: ToBackend) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const chat = ChatFrontend.updateFromApp({
    model: model.chat,
    msg,
    sendToBackend: (m) => () => {
      console.log('todo send to backend', m);
    },
  });

  const room = RoomFrontend.updateFromApp({
    model: model.room,
    msg,
    sendToBackend: (c) => sendToBackend({ t: 'room', c }),
  });

  const profile = ProfileFrontend.updateFromApp({
    model: model.profile,
    msg,
    sendToBackend: (c) => sendToBackend({ t: 'profile', c }),
  });
  return {
    model: {
      ...model,
      chat: chat.model,
      profile: profile.model,
      room: room.model,
    },
    cmd: Cmd.batch<Msg>([
      Cmd.tag_('chat', chat.cmd),
      Cmd.tag_('profile', profile.cmd),
      Cmd.tag_('room', room.cmd),
    ]),
  };
};

//
//
//
// Subscriptions
//
//
//

const subscriptions = ({
  now,
  model,
}: {
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  return Sub.batch<Msg>([
    Browser.onLocation(onLocationChange),
    Sub.tag_('→', toFrontend$),
    p(
      wireStatus$,
      Sub.map((wire) => ({ t: 'wire', wire }))
    ),
    Sub.tag_('auth', AuthFrontend.subscriptions),
    roomSub(now, model),
  ]);
};

const roomSub = (now: Posix, model: Model): Sub<Msg> => {
  if (model.auth.currentUser.t === 'logged-in') {
    return Sub.tag_(
      'room',
      RoomFrontend.subscriptions(
        {
          now,
          currentUserId: model.auth.currentUser.currentUserId,
          profiles: model.profile.profiles,
        },
        model.room
      )
    );
  }

  return Sub.None;
};

const onLocationChange = (location: Browser.Location): Msg => {
  return p(
    location.pathname,
    Route.decode,
    (route): Route.Route =>
      route ? route : { t: 'room', c: { t: 'room-list' } },
    (route): Msg => ({ t: 'route', c: { t: 'route-changed', c: route } })
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
  now,
}: {
  isTimeTravelDebugging: boolean;
  now: Posix;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <div className="max-w-md max-h-full mx-auto fixed w-full h-full overflow-hidden flex flex-col left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-neutral-800 bg-black text-white">
      {model.auth.currentUser.t === 'not-asked' && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12" />
        </div>
      )}

      {model.auth.currentUser.t === 'loading' && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12" />
        </div>
      )}

      {model.auth.currentUser.t === 'logged-out' && (
        <ViewLoggedOut
          $send={$send}
          model={model}
          ctx={{
            now,
            profiles: model.profile.profiles,
            $back: () => $send({ t: 'route', c: { t: 'clicked-back' } }),
            $push: (route) =>
              $send({ t: 'route', c: { t: 'clicked-link', c: route } }),
          }}
        />
      )}

      {model.auth.currentUser.t === 'logged-in' && (
        <ViewLoggedIn
          model={model}
          $send={$send}
          ctx={{
            now,
            currentUserId: model.auth.currentUser.currentUserId,
            profiles: model.profile.profiles,
            $push: (route) =>
              $send({ t: 'route', c: { t: 'clicked-link', c: route } }),
            $back: () => $send({ t: 'route', c: { t: 'clicked-back' } }),
          }}
        />
      )}

      <Alerts.View
        model={model.alerts}
        $send={(msg) => $send({ t: 'alerts', c: msg })}
      />

      {model.wire.type === 'connect-error' && model.wire.errorCount > 2 && (
        <div className="w-full flex items-center justify-center text-white bg-blue-500 gap-2 h-6">
          <IconSpinner className="w-5 h-5 text-white animate-spin" />
          Connecting to backend...
        </div>
      )}
    </div>
  );
};

const ViewLoggedOut = ({
  model,
  ctx,
  $send,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  if (model.route.t === 'auth') {
    return (
      <AuthFrontend.ViewLoggedOut
        $send={(m) => $send({ t: 'auth', c: m })}
        model={model.auth}
        ctx={ctx}
        route={model.route.c}
      />
    );
  }

  return (
    <AuthFrontend.ViewLoggedOut
      $send={(m) => $send({ t: 'auth', c: m })}
      model={model.auth}
      ctx={ctx}
      route={{ t: 'login' }}
    />
  );
};

const ViewLoggedIn = ({
  model,
  ctx,
  $send,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
}) => {
  if (model.route.t === 'chat') {
    return (
      <ChatFrontend.View
        $send={(m) => $send({ t: 'chat', c: m })}
        model={model.chat}
        ctx={ctx}
        route={model.route}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
        userSearch={{
          loading: model.profile.requests.search?.type === 'Loading',
          onInput: (query) => {
            $send({
              t: 'profile',
              c: { t: 'search', query },
            });
          },
        }}
      />
    );
  }

  if (model.route.t === 'room') {
    return (
      <RoomFrontend.View
        $send={(m) => $send({ t: 'room', c: m })}
        model={model.room}
        ctx={ctx}
        route={model.route.c}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  if (model.route.t === 'profile') {
    return (
      <ProfileFrontend.View
        $send={(m) => $send({ t: 'profile', c: m })}
        model={model.profile}
        ctx={ctx}
        route={model.route.c}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  if (model.route.t === 'auth') {
    return (
      <AuthFrontend.ViewLoggedIn
        $send={(m) => $send({ t: 'auth', c: m })}
        ctx={ctx}
        model={model.auth}
        route={model.route.c}
      />
    );
  }

  if (model.route.t === 'search') {
    return (
      <SearchFrontend.View
        $send={(m) => $send({ t: 'search', c: m })}
        model={model.search}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  const check: never = model.route;
  return check;
};

const ViewBottomBar = ({
  model,
  $send,
  ctx,
}: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
}) => {
  const items: {
    route: Route.Route;
    label: string;
    icon: ViewNode;
  }[] = [
    {
      route: {
        t: 'room',
        c: { t: 'room-list' },
      },
      label: 'Rooms',
      icon: <IconGamepad />,
    },
    {
      route: { t: 'search' },
      label: 'Search',
      icon: <IconMagnifyingGlass />,
    },
    {
      route: { t: 'profile', c: { t: 'profile', userId: ctx.currentUserId } },
      label: 'Profile',
      icon: <IconUserCircle />,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <RoomFrontend.ViewBottomBar
        ctx={ctx}
        model={model.room}
        $send={(c) => $send({ t: 'room', c })}
      />
      <div className="w-full flex items-center justify-center border-t border-neutral-600">
        {items.map((item) => {
          const isSelected = Route.eq(model.route, item.route);
          return (
            <button
              key={Route.encode(item.route)}
              onClick={() => ctx.$push(item.route)}
              className={cn(
                'flex items-center justify-center flex-col flex-1 pt-1 pb-2 gap-0.5',
                isSelected ? 'text-blue-500' : 'opacity-80'
              )}
            >
              {item.icon}
              <div className="text-xs">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
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

  const program = Program.create({
    init: init({ location: Browser.getLocation() }),
    update: (input) => update({ ...input, sendToBackend }),
    subscriptions,
  });

  const attached = Debug.ReduxDevTools.withDebugger(program);

  Program.run(attached.program);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  program.state$.subscribe((state) => {
    root.render(
      <View
        isTimeTravelDebugging={state.model._debugId < state.runningDebugId}
        now={state.model._now}
        model={state.model}
        $send={program.$send}
      />
    );
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
