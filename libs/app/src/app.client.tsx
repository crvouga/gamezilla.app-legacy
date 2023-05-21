import { AuthClient } from '@gamezilla/feat/auth';
import { ChatClient } from '@gamezilla/feat/chat';
import { ProfileClient } from '@gamezilla/feat/profile';
import { RoomClient } from '@gamezilla/feat/room';
import { SearchClient } from '@gamezilla/feat/search';
import {
  Alerts,
  AppMsg,
  Ctx,
  Route,
  UnauthenticatedViewCtx,
  ViewCtx,
} from '@gamezilla/shared/client';
import {
  Browser,
  Cmd,
  Posix,
  Sub,
  andThen,
  exhaustive,
  p,
} from '@gamezilla/shared/core';
import {
  IconGamepad,
  IconMagnifyingGlass,
  IconSpinner,
  IconUserCircle,
  ViewNode,
  cn,
} from '@gamezilla/shared/ui';
import { Subject } from 'rxjs';
import {
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  WireMsg,
} from './app.shared';

//
//
//
//
// Model
//
//
//
//

type Model = ClientModel;

export const init = ({
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
  const auth = AuthClient.init();
  const alerts = Alerts.init;
  const room = RoomClient.init();
  const profile = ProfileClient.init;
  const chat = ChatClient.init;
  const search = SearchClient.init;

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
        t: 'connecting',
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

type Msg = ClientMsg;

type OutAction<Msg = ClientMsg> = Alerts.Action<Msg>;

//
//
//
// Update
//
//
//

export const update = ({
  sendToServer,
  msg,
  model,
  now,
}: {
  now: Posix;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  return p(
    { model },
    andThen((input) => update_({ ...input, now, msg, sendToServer })),
    andThen((input) => {
      if (
        msg.t === 'auth' &&
        msg.c.t === 'got-current-user' &&
        msg.c.currentUser.t === 'logged-in'
      ) {
        const updated = updateFromApp({
          model: input.model,
          sendToServer,
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
  sendToServer,
  msg,
  model,
  now,
}: {
  now: Posix;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  actions?: OutAction[];
} => {
  switch (msg.t) {
    case '→': {
      return updateFromServer({ now, sendToServer, msg: msg.c, model });
    }

    case 'auth': {
      const updated = AuthClient.update({
        route: model.route,
        sendToServer: (c) => sendToServer({ t: 'auth', c }),
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
            sendToServer,
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
        sendToServer,
      });
      return {
        model: appUpdated.model,
        cmd: Cmd.batch([Cmd.tag_('route', routeUpdated.cmd), appUpdated.cmd]),
      };
    }

    case 'wire': {
      if (msg.c.t === 'connect-error') {
        return {
          model: {
            ...model,
            wire: {
              t: 'connect-error',
              errorCount:
                model.wire.t === 'connect-error'
                  ? model.wire.errorCount + 1
                  : 1,
            },
          },
        };
      }

      if (msg.c.t === 'connected') {
        const roomUpdated = RoomClient.updateFromApp({
          msg: { t: 'wire-connected' },
          model: model.room,
          sendToServer: (m) => sendToServer({ t: 'room', c: m }),
        });
        return {
          model: {
            ...model,
            room: roomUpdated.model,
            wire: {
              t: 'connected',
            },
          },
          cmd: Cmd.tag_('room', roomUpdated.cmd ?? Cmd.None),
        };
      }

      return { model: { ...model, wire: { t: msg.c.t } } };
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

      const updated = RoomClient.update({
        ctx: ctx,
        sendToServer: (m) => sendToServer({ t: 'room', c: m }),
        msg: msg.c,
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_('room', updated.cmd ?? Cmd.None),
      };
    }

    case 'profile': {
      const updated = ProfileClient.update({
        msg: msg.c,
        model: model.profile,
        sendToServer: (m) => sendToServer({ t: 'profile', c: m }),
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_('profile', updated.cmd),
      };
    }

    case 'chat': {
      const updated = ChatClient.update({ msg: msg.c, model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_('chat', updated?.cmd ?? Cmd.None),
      };
    }

    case 'search': {
      const updated = SearchClient.update({
        msg: msg.c,
        model: model.search,
        sendToServer: (m) => sendToServer({ t: 'search', c: m }),
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

const updateFromServer = ({
  sendToServer,
  msg,
  now,
  model,
}: {
  sendToServer: (m: ToServer) => Cmd;
  msg: ToClient;
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

      const updated = RoomClient.updateFromServer({
        ctx,
        sendToServer: (msg) => sendToServer({ t: 'room', c: msg }),
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
      const updated = ProfileClient.updateFromServer({
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
      const updated = SearchClient.updateFromServer({
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
      const updated = AuthClient.updateFromServer({
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
      const updated = ChatClient.updateFromServer({
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
  sendToServer,
}: {
  model: Model;
  msg: AppMsg;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const chat = ChatClient.updateFromApp({
    model: model.chat,
    msg,
    sendToServer: (m) => () => {
      console.log('todo send to backend', m);
    },
  });

  const room = RoomClient.updateFromApp({
    model: model.room,
    msg,
    sendToServer: (c) => sendToServer({ t: 'room', c }),
  });

  const profile = ProfileClient.updateFromApp({
    model: model.profile,
    msg,
    sendToServer: (c) => sendToServer({ t: 'profile', c }),
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

export const subscriptions = ({
  now,
  model,
}: {
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  return Sub.batch<Msg>([
    Browser.onLocation(onLocationChange),
    Sub.tag_('→', toClient$),
    Sub.tag_('wire', wireMsg$),
    Sub.tag_('auth', AuthClient.subscriptions),
    roomSub(now, model),
  ]);
};

const roomSub = (now: Posix, model: Model): Sub<Msg> => {
  if (model.auth.currentUser.t === 'logged-in') {
    return Sub.tag_(
      'room',
      RoomClient.subscriptions(
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

export const View = ({
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
    <div className="max-w-md max-h-full mx-auto fixed w-full h-full overflow-hidden flex flex-col left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-neutral-800 bg-black text-white select-none touch-none">
      {model.auth.currentUser.t === 'not-asked' && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12 animate-spin" />
        </div>
      )}

      {model.auth.currentUser.t === 'loading' && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12 animate-spin" />
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

      {model.wire.t === 'connect-error' && model.wire.errorCount > 2 && (
        <div className="w-full flex items-center justify-center text-white bg-blue-500 gap-2 h-6">
          <IconSpinner className="w-5 h-5 text-white animate-spin" />
          Connecting to server...
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
      <AuthClient.ViewLoggedOut
        $send={(m) => $send({ t: 'auth', c: m })}
        model={model.auth}
        ctx={ctx}
        route={model.route.c}
      />
    );
  }

  return (
    <AuthClient.ViewLoggedOut
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
      <ChatClient.View
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
      <RoomClient.View
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
      <ProfileClient.View
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
      <AuthClient.ViewLoggedIn
        $send={(m) => $send({ t: 'auth', c: m })}
        ctx={ctx}
        model={model.auth}
        route={model.route.c}
      />
    );
  }

  if (model.route.t === 'search') {
    return (
      <SearchClient.View
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
      <RoomClient.ViewBottomBar
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

export const wireMsg$ = new Subject<WireMsg>();
export const toClient$ = new Subject<ToClient>();
