import {
  APP_SOUND,
  AnonymousClientCtx,
  AnonymousViewCtx,
  AppRoute,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  ViewCtx,
  preloadSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconUserCircle,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Browser, Eff, Posix, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import * as AuthClient from "./@CHILD/auth/auth.client";
import * as ChatClient from "./@CHILD/chat/chat.client";
import * as ProfileClient from "./@CHILD/profile/profile.client";
import * as SearchClient from "./@CHILD/search/search.client";
import * as SpaceClient from "./@CHILD/space/space.client";
import { ClientTransport } from "./@CHILD/wire/transport-client";
import * as Wire from "./@CHILD/wire/wire.client";
import { AppClient } from "./@SHARED/architecture";
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client";
import {
  APP_CONFIG,
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
} from "./app.core";

//
//
//
// Transport
//
//
//

export const transport = ClientTransport<ToServer, ToClient>({
  impl: {
    t: "web-sockets",
    serverUrl: APP_CONFIG.SERVER_URL,
    endpoint: APP_CONFIG.WEB_SOCKETS_ENDPOINT,
  },
});

//
//
//
//
//
//
//
//

export type Client = AppClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  ClientCtx: { now: Posix };
  ViewCtx: { now: Posix };
  Cmd: never;
}>;

//
//
//
//
// Model
//
//
//
//

export const init = ({
  location,
  stored,
  ctx,
}: {
  stored: ClientModel | null;
  ctx: { now: Posix };
  location: Browser.Location;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  const routing = Routing.init({
    location,
    stored: stored?.routing ?? null,
  });
  const appCtx: ClientCtx | AnonymousClientCtx = {
    currentRoute: routing.model.currentRoute,
    currentUserId: null,
    documentVisibilityState: "visible",
    now: ctx.now,
    profiles: {},
  };

  const toast = Toast.init({
    stored: stored?.toast ?? null,
    ctx: ctx,
  });

  const wire = Wire.init({
    stored: stored?.wire ?? null,
  });

  const auth = AuthClient.init({
    stored: stored?.auth ?? null,
    ctx: appCtx,
  });

  const space = SpaceClient.init({
    stored: stored?.space ?? null,
  });

  const profile = ProfileClient.init({
    ctx: appCtx,
    stored: stored?.profile ?? null,
  });

  const chat = ChatClient.init({
    stored: stored?.chat ?? null,
  });

  const search = SearchClient.init({
    stored: stored?.search ?? null,
  });

  const sound = Sound.init({
    stored: stored?.sound ?? null,
  });

  const platform = Platform.init({
    stored: stored?.platform ?? null,
  });

  const statusBar = StatusBar.init({
    stored: stored?.statusBar ?? null,
  });

  let acc: ReturnType<typeof init> = {
    model: {
      statusBar: statusBar.model,
      routing: routing.model,
      toast: toast.model,
      wire: wire.model,
      sound: sound.model,
      platform: platform.model,
      chat: chat.model,
      space: space.model,
      auth: auth.model,
      search: search.model,
      profile: profile.model,
    },
    eff: Eff.batch<ClientMsg>([routing.eff, Eff.t("auth", auth.eff)]),
  };

  const cmdList: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[] = [
    ...ClientCmd.tag("space", space.cmd),
    ...ClientCmd.tag(
      "profile",
      profile.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
    ),
    preloadSound(Object.values(APP_SOUND)),
  ];

  for (const cmd of cmdList) {
    const updatedCmd = updateFromCmd({ model: acc.model, cmd });
    acc = {
      model: updatedCmd.model,
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
    };
  }

  return acc;
};

//
//
//
// Update
//
//
//

export const update = (input: {
  ctx: { now: Posix };
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  // console.log("[msg]", toMsgType(input.msg));
  let acc = updateMain(input);

  for (const evt of acc.evt ?? []) {
    // console.log("[evt]", toMsgType(evt));
    const updatedEvt = updateFromEvent({
      ...input,
      model: acc.model,
      msg: evt,
    });
    acc = {
      model: updatedEvt.model,
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      cmd: batchMsgs(acc.cmd, updatedEvt.cmd),
    };
  }

  for (const cmd of acc.cmd ?? []) {
    // console.log("[cmd]", toMsgType(cmd));
    const updatedCmd = updateFromCmd({ ...input, model: acc.model, cmd });
    acc = {
      model: updatedCmd.model,
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
    };
  }

  return acc;
};

const updateMain = ({
  msg,
  model,
  ctx,
}: {
  ctx: { now: Posix };
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const ctxApp = toCtx({ model, ctx });

  switch (msg.t) {
    case "➡️": {
      return updateFromServer({
        ctx: ctxApp,
        msg: msg.c,
        model,
      });
    }

    case "auth": {
      const updated = AuthClient.update({
        ctx: ctxApp,
        msg: { ...msg.c, variant: "msg" },
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        eff: Eff.t("auth", updated.eff),
        evt: updated.msg?.flatMap((x) => (x.variant === "evt" ? [x] : [])),
        cmd: ClientCmd.tag(
          "auth",
          updated.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
        ),
      };
    }

    case "toast": {
      const updated = Toast.update({
        t: 'msg',
        ctx: ctx,
        model: model.toast,
        msg: msg.c,
      });
      return {
        model: { ...model, toast: updated.model },
        eff: Eff.t("toast", updated.eff),
      };
    }

    case "routing": {
      const updated = Routing.update({
        msg: msg.c,
        model: model.routing,
      });

      return {
        model: { ...model, routing: updated.model },
        eff: Eff.t("routing", updated.eff),
        evt: updated.evt,
        cmd: updated.cmd,
      };
    }

    case "wire": {
      const updated = Wire.update({
        msg: msg.c,
        model: model.wire,
        transport,
      });

      return {
        model: { ...model, wire: updated.model },
        evt: updated.evt,
        eff: Eff.t("wire", updated.eff),
      };
    }

    case "sound": {
      const updated = Sound.update({
        msg: msg.c,
        model: model.sound,
      });
      const cmd = ClientCmd.map(
        updated?.cmd ?? [],
        (x) => x,
        (x) => ({ t: "sound", c: x })
      );
      return {
        model: { ...model, sound: updated.model },
        cmd,
      };
    }

    case "space": {
      const updated = SpaceClient.update({
        ctx: ctxApp,
        msg: msg.c,
        model: model.space,
      });

      return {
        model: { ...model, space: updated.model },
        eff: Eff.t("space", updated.eff ?? Eff.None),
        evt: updated.evt,
        cmd: ClientCmd.tag("space", updated.cmd),
      };
    }

    case "profile": {
      const updated = ProfileClient.update({
        msg: { ...msg.c, variant: "msg" },
        model: model.profile,
        ctx: ctxApp,
      });
      return {
        model: { ...model, profile: updated.model },
        eff: Eff.t("profile", updated.eff),
        cmd: ClientCmd.tag(
          "profile",
          updated.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
        ),
        evt: updated.msg?.flatMap((x) => (x.variant === "evt" ? [x] : [])),
      };
    }

    case "chat": {
      const updated = ChatClient.update({ msg: msg.c, model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated?.eff ?? Eff.None),
      };
    }

    case "search": {
      const updated = SearchClient.update({
        msg: msg.c,
        model: model.search,
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
        cmd: ClientCmd.tag("search", updated.cmd),
      };
    }

    case "platform": {
      const updated = Platform.update({
        msg: msg.c,
        model: model.platform,
      });
      return {
        model: { ...model, platform: updated.model },
      };
    }

    case "status-bar": {
      const updated = StatusBar.update({
        msg: msg.c,
        model: model.statusBar,
      });
      return {
        model: { ...model, statusBar: updated.model },
      };
    }
  }
};

const toCtx = (input: {
  model: ClientModel;
  ctx: { now: Posix };
}): ClientCtx | AnonymousClientCtx => {
  const anonymousCtx: AnonymousClientCtx = {
    profiles: input.model.profile.profiles,
    now: input.ctx.now,
    documentVisibilityState: input.model.platform.documentVisibilityState,
    currentRoute: input.model.routing.currentRoute,
    currentUserId: null,
  };
  if (input.model.auth.currentUser.t === "logged-in") {
    return {
      ...anonymousCtx,
      currentUserId: input.model.auth.currentUser.userId,
    };
  }
  return anonymousCtx;
};

const updateFromServer = ({
  msg,
  ctx,
  model,
}: {
  msg: ToClient;
  model: ClientModel;
  ctx: ClientCtx | AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "auth": {
      const updated = AuthClient.update({
        ctx,
        msg: { ...msg.c, variant: "from-server" },
        model: model.auth,
      });
      return {
        evt: updated.msg?.flatMap((x) => (x.variant === "evt" ? [x] : [])),
        model: { ...model, auth: updated.model },
        eff: Eff.t("auth", updated.eff),
        cmd: ClientCmd.tag(
          "auth",
          updated.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
        ),
      };
    }

    case "search": {
      const updated = SearchClient.updateFromServer({
        msg: msg.c,
        model: model.search,
      });
      return {
        ...updated,
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
      };
    }

    case "chat": {
      const updated = ChatClient.updateFromServer({
        msg: msg.c,
        model: model.chat,
      });
      return {
        ...updated,
        model: { ...model, chat: updated.model },
        eff: Eff.t("chat", updated.eff),
      };
    }

    case "space": {
      const updated = SpaceClient.updateFromServer({
        ctx,
        msg: msg.c,
        model: model.space,
      });

      return {
        evt: updated.evt,
        cmd: ClientCmd.tag("space", updated.cmd),
        model: { ...model, space: updated.model },
        eff: Eff.t("space", updated.eff),
      };
    }

    case "profile": {
      const updated = ProfileClient.update({
        msg: { ...msg.c, variant: "from-server" },
        model: model.profile,
        ctx,
      });
      return {
        cmd: ClientCmd.tag(
          "profile",
          updated.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
        ),
        model: { ...model, profile: updated.model },
        eff: Eff.t("profile", updated.eff),
      };
    }

    case "wire": {
      const updated = Wire.updateFromServer({
        msg: msg.c,
        model: model.wire,
      });

      return {
        model: { ...model, wire: updated.model },
        cmd: ClientCmd.tag("wire", updated.cmd),
      };
    }
  }
};

const updateFromCmd = ({
  model,
  cmd,
}: {
  model: ClientModel;
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  const ctxApp = toCtx({ model, ctx: { now: Posix.now$() } });
  switch (cmd.t) {
    case "routing/replace":
    case "routing/back":
    case "routing/push": {
      const routing = Routing.updateFromCmd({
        model: model.routing,
        cmd,
      });

      return {
        model: {
          ...model,
          routing: routing.model,
        },
        eff: Eff.t("routing", routing.eff),
      };
    }

    case "toast/enqueue": {
      const toast = Toast.update({
        model: model.toast,
        msg: cmd,
        ctx: ctxApp,
        t: 'cmd'
      });

      return {
        model: {
          ...model,
          toast: toast.model,
        },
        eff: Eff.t("toast", toast.eff),
      };
    }

    case "sound/preload":
    case "sound/play": {
      const sound = Sound.updateFromCmd({
        model: model.sound,
        cmd,
      });
      return {
        model: { ...model, sound: sound.model },
        eff: Eff.t("sound", sound.eff),
      };
    }

    case "platform/start-timeout":
    case "platform/cancel-timeout":
    case "platform/focus": {
      const updated = Platform.updateFromCmd({
        model: model.platform,
        cmd,
      });
      return {
        model: { ...model, platform: updated.model },
        eff: Eff.batch([Eff.t("platform", updated.eff), updated.parentEff]),
      };
    }

    case "wire/send-to-server": {
      const updated = Wire.updateFromCmd({
        cmd,
        transport,
        model: model.wire,
      });
      return {
        model: { ...model, wire: updated.model },
        eff: Eff.t("wire", updated.eff),
      };
    }

    case "profile/add-profiles": {
      const updated = ProfileClient.update({
        msg: cmd,
        model: model.profile,
        ctx: ctxApp,
      });

      return {
        model: { ...model, profile: updated.model },
      };
    }
  }
};

const updateFromEvent = ({
  model,
  msg,
  ctx,
}: {
  ctx: { now: Posix };
  model: ClientModel;
  msg: ClientEvt;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const ctxApp = toCtx({ model, ctx });

  const chat = ChatClient.updateFromEvent({
    model: model.chat,
    msg,
  });

  const space = SpaceClient.updateFromEvent({
    model: model.space,
    msg,
    ctx: ctxApp,
  });

  const profile = ProfileClient.update({
    model: model.profile,
    msg: { ...msg, variant: "evt" },
    ctx: ctxApp,
  });

  const auth = AuthClient.updateFromEvent({
    model: model.auth,
    msg: { ...msg, variant: "evt" },
    ctx: ctxApp,
  });

  return {
    model: {
      ...model,
      chat: chat.model,
      profile: profile.model,
      space: space.model,
      auth: auth.model,
    },
    eff: Eff.batch<ClientMsg>([
      Eff.t("chat", chat.eff),
      Eff.t("profile", profile.eff),
      Eff.t("auth", auth.eff),
    ]),
    cmd: [
      ...ClientCmd.tag("space", space.cmd),
      ...ClientCmd.tag(
        "auth",
        auth.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
      ),
      ...ClientCmd.tag(
        "profile",
        profile.msg?.flatMap((x) => (x.variant === "cmd" ? [x] : []))
      ),
    ],
  };
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = (input: {
  ctx: { now: Posix };
  intervalId: string;
  model: ClientModel;
}): Sub<ClientMsg> => {
  const { ctx, model, intervalId } = input;

  const ctxApp = toCtx(input);

  return Sub.batch<ClientMsg>([
    Sub.tag("➡️", Sub.flat(transport.toClient)),
    Sub.tag("wire", Wire.subscriptions({ transport })),
    Sub.tag("platform", Platform.subscriptions),
    Sub.tag("routing", Routing.subscriptions),
    Sub.tag(
      "toast",
      Toast.subscriptions({
        ctx: ctx,
        intervalId: `${intervalId}/toast`,
        model: model.toast,
      })
    ),
    Sub.tag(
      "auth",
      AuthClient.subscriptions({
        ctx: ctxApp,
        intervalId: `${intervalId}/auth`,
        model: model.auth,
      })
    ),
    Sub.tag("space", SpaceClient.subscriptions(ctxApp, model.space)),
  ]);
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
  dispatch,
  now,
}: {
  now: Posix;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  return (
    <div class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <StatusBar.View
        model={model.statusBar}
        dispatch={(c) => dispatch({ t: "status-bar", c })}
        wire={{
          drawer: (
            <Wire.ViewStatusBarDrawer
              model={model.wire}
              dispatch={(c) => dispatch({ t: "wire", c })}
            />
          ),
          statusBar: <Wire.ViewStatusBar model={model.wire} />,
        }}
        sound={{
          drawer: (
            <Sound.ViewStatusBarDrawer
              model={model.sound}
              dispatch={(c) => dispatch({ t: "sound", c })}
            />
          ),
          statusBar: <Sound.ViewStatusBar model={model.sound} />,
        }}
      />

      <div class="flex w-full flex-1 flex-col overflow-hidden ">
        <ViewMain model={model} now={now} dispatch={dispatch} />
      </div>

      <Toast.View
        ctx={{ now }}
        model={model.toast}
        dispatch={(c) => dispatch({ t: "toast", c })}
      />
    </div>
  );
};

const ViewMain = ({
  model,
  dispatch,
  now,
}: {
  now: Posix;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  switch (model.auth.currentUser.t) {
    case "logged-in": {
      return (
        <ViewLoggedIn
          model={model}
          dispatch={dispatch}
          ctx={{
            now,
            serverTime: model.wire.serverTime,
            currentRoute: model.routing.currentRoute,
            currentUserId: model.auth.currentUser.userId,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
            push: (route) =>
              dispatch({ t: "routing", c: { t: "clicked-link", route } }),
          }}
        />
      );
    }
    case "logged-out": {
      return (
        <ViewLoggedOut
          dispatch={dispatch}
          model={model}
          ctx={{
            now,
            serverTime: model.wire.serverTime,
            currentRoute: model.routing.currentRoute,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
            push: (route) =>
              dispatch({
                t: "routing",
                c: { t: "clicked-link", route },
              }),
          }}
        />
      );
    }

    case "loading": {
      return <LogoScreen />;
    }
  }
};

const LogoScreen = () => {
  return (
    <div class="flex h-full w-full items-center justify-center text-8xl">
      🦕
    </div>
  );
};

const ViewLoggedOut = ({
  model,
  ctx,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
  ctx: AnonymousViewCtx;
}) => {
  if (model.routing.currentRoute.t === "auth") {
    return (
      <AuthClient.View
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        model={model.auth}
        ctx={{ ...ctx, route: model.routing.currentRoute.c }}
      />
    );
  }

  return <LogoScreen />;
};

const ViewLoggedIn = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  switch (model.routing.currentRoute.t) {
    case "chat": {
      return (
        <ChatClient.View
          dispatch={(m) => dispatch({ t: "chat", c: m })}
          model={model.chat}
          ctx={ctx}
          route={model.routing.currentRoute.c}
          viewBottomBar={
            <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
          }
          userSearch={{
            loading: model.profile.requests.search?.t === "loading",
            onInput: (query) => {
              dispatch({
                t: "profile",
                c: { t: "search", query },
              });
            },
          }}
        />
      );
    }

    case "space": {
      return (
        <SpaceClient.View
          dispatch={(m) => dispatch({ t: "space", c: m })}
          model={model.space}
          ctx={ctx}
          route={model.routing.currentRoute.c}
          viewBottomBar={
            <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
          }
        />
      );
    }

    case "profile": {
      return (
        <ProfileClient.View
          dispatch={(m) => dispatch({ t: "profile", c: m })}
          model={model.profile}
          ctx={{
            ...ctx,
            route: model.routing.currentRoute.c,
            viewBottomBar: (
              <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
            ),
          }}
        />
      );
    }

    case "search": {
      return (
        <SearchClient.View
          dispatch={(m) => dispatch({ t: "search", c: m })}
          model={model.search}
          viewBottomBar={
            <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
          }
        />
      );
    }

    case "logout": {
      return (
        <AuthClient.ViewLogoutScreen
          dispatch={(m) => dispatch({ t: "auth", c: m })}
          ctx={ctx}
          model={model.auth}
        />
      );
    }

    case "auth": {
      return <LogoScreen />;
    }
  }
};

const ViewBottomBar = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  const items: {
    route: AppRoute;
    label: string;
    icon: VDom;
  }[] = [
    {
      route: {
        t: "space",
        c: { t: "space-list" },
      },
      label: "Spaces",
      icon: <IconGamepad class="h-6 w-6" />,
    },
    {
      route: { t: "profile", c: { t: "profile", userId: ctx.currentUserId } },
      label: "Profile",
      icon: <IconUserCircle class="h-6 w-6" />,
    },
  ];

  return (
    <div class="flex w-full flex-col items-center justify-center">
      <SpaceClient.ViewCurrentSpaceBar
        ctx={ctx}
        model={model.space}
        dispatch={(c) => dispatch({ t: "space", c })}
      />
      <div class="flex w-full items-center justify-center border-t border-neutral-700">
        {items.map((item) => {
          const isSelected = AppRoute.eq(
            model.routing.currentRoute,
            item.route
          );
          return (
            <button
              key={AppRoute.encode(item.route)}
              onClick={() => ctx.push(item.route)}
              class={cn(
                "flex flex-1 flex-col items-center justify-center pb-2 pt-1",
                isSelected ? "text-blue-500" : "opacity-80"
              )}>
              {item.icon}
              <div class="mt-0.5 text-xs">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
