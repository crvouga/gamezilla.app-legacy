import {
  APP_SOUND,
  AnonymousClientCtx,
  AppRoute,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  preloadSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconUserCircle,
  Spinner,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  Browser,
  Eff,
  Posix,
  Sub,
  batchMsgs,
  toMsgType,
} from "gamezilla/@SHARED/core";
import * as AuthClient from "./@CHILD/auth/auth.client";
import * as ProfileClient from "./@CHILD/profile/profile.client";
import * as SpaceClient from "./@CHILD/space/space.client";
import { ClientTransport } from "./@CHILD/wire/transport-client";
import * as Wire from "./@CHILD/wire/wire.client";
import { Platform, Routing, Sound, StatusBar, Toast } from "./app-client";
import {
  PUBLIC_APP_CONFIG,
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
    serverUrl: PUBLIC_APP_CONFIG.SERVER_URL,
    endpoint: PUBLIC_APP_CONFIG.WEB_SOCKETS_ENDPOINT,
  },
  codebaseVersionId: PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID,
});

//
//
//
//
// Model
//
//
//
//

export const init = async ({
  location,
  stored,
  ctx,
}: {
  stored: ClientModel | null;
  ctx: { now: Posix };
  location: Browser.Location;
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
}> => {
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

  const toast = await Toast.init({
    stored: stored?.toast ?? null,
    ctx: ctx,
  });

  const wire = await Wire.init({
    stored: stored?.wire ?? null,
  });

  const auth = await AuthClient.init({
    stored: stored?.auth ?? null,
    ctx: appCtx,
  });

  const space = await SpaceClient.init({
    ctx: appCtx,
    stored: stored?.space ?? null,
  });

  const profile = await ProfileClient.init({
    ctx: { ...appCtx, viewBottomBar: null },
    stored: stored?.profile ?? null,
  });

  const sound = await Sound.init({
    ctx: null,
    stored: stored?.sound ?? null,
  });

  const platform = await Platform.init({
    stored: stored?.platform ?? null,
  });

  const statusBar = await StatusBar.init({
    stored: stored?.statusBar ?? null,
  });

  const initialModel: ClientModel = {
    statusBar: statusBar.model,
    routing: routing.model,
    toast: toast.model,
    wire: wire.model,
    sound: sound.model,
    platform: platform.model,
    space: space.model,
    auth: auth.model,
    profile: profile.model,
  };

  const initialEff = Eff.batch<ClientMsg>([
    routing.eff,
    Eff.tag("auth", auth.eff),
  ]);

  const initialCmd = batchMsgs<
    ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>
  >(
    ClientCmd.tag("space", space.cmd),
    ClientCmd.tag("profile", profile.cmd),
    preloadSound(Object.values(APP_SOUND))
  );

  const updated = await updateLoop(ctx.now, {
    model: initialModel,
    eff: initialEff,
    cmd: initialCmd,
    evt: [],
  });

  return {
    model: updated.model,
    eff: updated.eff,
  };
};

//
//
//
// Update
//
//
//

export const update = async (input: {
  ctx: { now: Posix };
  msg: ClientMsg;
  model: ClientModel;
}): Promise<{
  model: ClientModel;
  eff?: Eff<ClientMsg>;
}> => {
  if (input.msg) {
    console.log("[msg]", toMsgType(input.msg));
  }
  const fromServer = input.msg.t === "➡️" ? input.msg.c : undefined;
  if (fromServer) {
    console.log("[➡️]", toMsgType(fromServer));
  }
  const updatedFromMsg = await updateChild({
    now: input.ctx.now,
    model: input.model,
    msg: input.msg,
    fromServer: fromServer,
  });

  const updated = await updateLoop(input.ctx.now, updatedFromMsg);

  return updated;
};

type Output = {
  model: ClientModel;
  eff: Eff<ClientMsg>;
  evt: ClientEvt[];
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
};

const updateLoop = async (now: Posix, acc: Output): Promise<Output> => {
  const [cmd, ...cmdRest] = acc.cmd;

  if (cmd) {
    console.log("[cmd]", toMsgType(cmd));
    const updatedCmd = await updateChild({ now, model: acc.model, cmd });
    return updateLoop(now, {
      model: updatedCmd.model,
      cmd: [...cmdRest, ...updatedCmd.cmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      evt: batchMsgs(acc.evt, updatedCmd.evt),
    });
  }

  const [evt, ...evtRest] = acc.evt;

  if (evt) {
    console.log("[evt]", toMsgType(evt));
    const updatedEvt = await updateChild({ now, model: acc.model, evt });
    return updateLoop(now, {
      model: updatedEvt.model,
      cmd: [...cmdRest, ...updatedEvt.cmd],
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      evt: batchMsgs(evtRest, updatedEvt.evt),
    });
  }

  return acc;
};

const updateChild = async ({
  now,
  model,
  msg,
  fromServer,
  evt,
  cmd,
}: {
  now: Posix;
  model: ClientModel;
  msg?: ClientMsg;
  fromServer?: ToClient;
  evt?: ClientEvt;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
}): Promise<Output> => {
  const ctx = toCtx({ model, ctx: { now } });

  const space = await SpaceClient.update({
    ctx: ctx,
    model: model.space,
    msg: msg?.t === "space" ? msg.c : null,
    fromServer: fromServer?.t === "space" ? fromServer.c : null,
    evt: evt,
    cmd: null,
  });

  const profile = await ProfileClient.update({
    ctx: { ...ctx, viewBottomBar: null },
    model: model.profile,
    msg: msg?.t === "profile" ? msg.c : null,
    fromServer: fromServer?.t === "profile" ? fromServer.c : null,
    evt: evt,
    cmd: cmd?.t === "profile" ? cmd : null,
  });

  const auth = await AuthClient.update({
    ctx: ctx,
    model: model.auth,
    msg: msg?.t === "auth" ? msg.c : null,
    fromServer: fromServer?.t === "auth" ? fromServer.c : null,
    evt: evt,
    cmd: null,
  });

  const routing = await Routing.update({
    model: model.routing,
    msg: msg?.t === "routing" ? msg.c : null,
    cmd: cmd?.t === "routing" ? cmd : null,
  });

  const wire = await Wire.update({
    model: model.wire,
    msg: msg?.t === "wire" ? msg.c : null,
    fromServer: fromServer?.t === "wire" ? fromServer.c : null,
    cmd: cmd?.t === "wire" ? cmd : null,
    transport,
  });

  const sound = await Sound.update({
    model: model.sound,
    msg: msg?.t === "sound" ? msg.c : null,
    cmd: cmd?.t === "sound" ? cmd : null,
    ctx: null,
  });

  const platform = await Platform.update({
    model: model.platform,
    msg: msg?.t === "platform" ? msg.c : null,
    cmd: cmd?.t === "platform" ? cmd : null,
  });

  const statusBar = await StatusBar.update({
    model: model.statusBar,
    msg: msg?.t === "status-bar" ? msg.c : null,
  });

  const toast = await Toast.update({
    model: model.toast,
    msg: msg?.t === "toast" ? msg.c : null,
    cmd: cmd?.t === "toast" ? cmd : null,
    ctx: ctx,
    evt: null,
    fromServer: null,
  });

  return {
    model: {
      auth: auth.model,
      platform: platform.model,
      profile: profile.model,
      routing: routing.model,
      sound: sound.model,
      space: space.model,
      statusBar: statusBar.model,
      toast: toast.model,
      wire: wire.model,
    },

    eff: Eff.batch<ClientMsg>([
      Eff.tag("auth", auth.eff),
      Eff.tag("platform", platform.eff),
      Eff.tag("profile", profile.eff),
      Eff.tag("routing", routing.eff),
      Eff.tag("sound", sound.eff),
      Eff.tag("space", space.eff),
      Eff.tag("status-bar", statusBar.eff),
      Eff.tag("toast", toast.eff),
      Eff.tag("wire", wire.eff),
    ]),

    evt: batchMsgs<ClientEvt>(
      auth.evt,
      profile.evt,
      routing.evt,
      sound.evt,
      space.evt,
      toast.evt,
      wire.evt
    ),

    cmd: batchMsgs<ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>>(
      ClientCmd.tag("auth", auth.cmd),
      ClientCmd.tag("profile", profile.cmd),
      ClientCmd.tag("space", space.cmd),
      routing.cmd,
      sound.cmd,
      toast.cmd
    ),
  };
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
  model: ClientModel;
}): Sub<ClientMsg> => {
  const { ctx, model } = input;

  const ctxApp = toCtx(input);

  return Sub.batch<ClientMsg>([
    Sub.tag("➡️", Sub.flat(transport.toClient)),
    Sub.tag("wire", Wire.subscriptions({ transport })),
    Sub.tag("platform", Platform.subscriptions),
    Sub.tag("routing", Routing.subscriptions),
    Sub.tag("toast", Toast.subscriptions({ ctx, model: model.toast })),
    Sub.tag(
      "auth",
      AuthClient.subscriptions({ ctx: ctxApp, model: model.auth })
    ),
    Sub.tag(
      "space",
      SpaceClient.subscriptions({ ctx: ctxApp, model: model.space })
    ),
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
    <div
      className="fixed left-1/2 top-1/2 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black text-white"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="relative flex h-full max-h-[915px] w-full max-w-[520px] flex-col items-center justify-center overflow-hidden rounded border border-neutral-600">
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

        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <ViewMain model={model} now={now} dispatch={dispatch} />
        </div>

        <Toast.View
          ctx={{ now }}
          model={model.toast}
          dispatch={(c) => dispatch({ t: "toast", c })}
        />
      </div>
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
            currentRoute: model.routing.currentRoute,
            currentUserId: model.auth.currentUser.userId,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
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
            currentRoute: model.routing.currentRoute,
            profiles: model.profile.profiles,
            documentVisibilityState: model.platform.documentVisibilityState,
          }}
        />
      );
    }

    case "loading": {
      return <ViewSplashScreen />;
    }
  }
};

const ViewSplashScreen = () => {
  return (
    <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1">
      <h1 className="bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text pb-2 text-5xl font-extrabold text-transparent">
        gamezilla.app
      </h1>
      <Spinner />
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
  ctx: AnonymousClientCtx;
}) => {
  switch (model.routing.currentRoute.t) {
    case "auth": {
      return (
        <AuthClient.View
          dispatch={(m) => dispatch({ t: "auth", c: m })}
          model={model.auth}
          ctx={ctx}
        />
      );
    }
    default: {
      return <ViewSplashScreen />;
    }
  }
};

const ViewLoggedIn = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: ClientCtx;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  switch (model.routing.currentRoute.t) {
    case "chat": {
      return null;
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
            viewBottomBar: (
              <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
            ),
          }}
        />
      );
    }

    case "search": {
      return null;
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
      return <ViewSplashScreen />;
    }
  }
};

const ViewBottomBar = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: ClientCtx;
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
      icon: <IconGamepad className="h-6 w-6" />,
    },
    {
      route: { t: "profile", c: { t: "profile", userId: ctx.currentUserId } },
      label: "Profile",
      icon: <IconUserCircle className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <SpaceClient.ViewCurrentSpaceBar
        ctx={ctx}
        model={model.space}
        dispatch={(c) => dispatch({ t: "space", c })}
      />
      <div className="flex w-full items-center justify-center border-t border-neutral-600">
        {items.map((item, index) => {
          const isSelected = AppRoute.eq(
            model.routing.currentRoute,
            item.route
          );

          return (
            <button
              key={AppRoute.encode(item.route)}
              onClick={() =>
                dispatch({
                  t: "routing",
                  c: { t: "clicked-link", route: item.route },
                })
              }
              className={cn(
                "flex flex-1 flex-col items-center justify-center pb-2 pt-1",
                isSelected ? "text-blue-500" : "text-opacity-50",
                index < items.length - 1 ? "border-r border-neutral-600" : ""
              )}
            >
              {item.icon}
              <div className="mt-0.5 text-xs text-inherit">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
