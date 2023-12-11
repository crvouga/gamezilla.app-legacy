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
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconUserCircle,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Browser, Eff, Posix, Sub, batchMsgs } from "gamezilla/@SHARED/core";
import * as AuthClient from "./@CHILD/auth/auth.client";
import * as ProfileClient from "./@CHILD/profile/profile.client";
import * as SpaceClient from "./@CHILD/space/space.client";
import { ClientTransport } from "./@CHILD/wire/transport-client";
import * as Wire from "./@CHILD/wire/wire.client";
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
    ctx: appCtx,
    stored: stored?.space ?? null,
  });

  const profile = ProfileClient.init({
    ctx: { ...appCtx, viewBottomBar: null },
    stored: stored?.profile ?? null,
  });

  const sound = Sound.init({
    ctx: null,
    stored: stored?.sound ?? null,
  });

  const platform = Platform.init({
    stored: stored?.platform ?? null,
  });

  const statusBar = StatusBar.init({
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
    Eff.t("auth", auth.eff),
  ]);

  const initialCmd = batchMsgs<
    ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>
  >(
    ClientCmd.tag("space", space.cmd),
    ClientCmd.tag("profile", profile.cmd),
    preloadSound(Object.values(APP_SOUND))
  );

  const updated = updateLoop(ctx.now, {
    model: initialModel,
    eff: initialEff,
    cmd: initialCmd,
    evt: [],
    toServer: [],
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

export const update = (input: {
  ctx: { now: Posix };
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  const updatedFromMsg = updateChild({
    now: input.ctx.now,
    model: input.model,
    msg: input.msg,
    fromServer: input.msg.t === "➡️" ? input.msg.c : undefined,
  });

  const updated = updateLoop(input.ctx.now, updatedFromMsg);

  return updated;
};

type Output = {
  model: ClientModel;
  eff: Eff<ClientMsg>;
  evt: ClientEvt[];
  cmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
  toServer: ToServer[];
};

const updateLoop = (now: Posix, acc: Output): Output => {
  const [cmd, ...cmdRest] = acc.cmd;

  if (cmd) {
    const updatedCmd = updateChild({ now, model: acc.model, cmd });
    return updateLoop(now, {
      model: updatedCmd.model,
      cmd: [...cmdRest, ...updatedCmd.cmd],
      eff: Eff.batch([acc.eff, updatedCmd.eff]),
      evt: batchMsgs(acc.evt, updatedCmd.evt),
      toServer: batchMsgs(acc.toServer, updatedCmd.toServer),
    });
  }

  const cmds = acc.toServer.map((c) => sendToServer(c));

  if (cmds.length > 0) {
    return updateLoop(now, {
      model: acc.model,
      eff: acc.eff,
      evt: acc.evt,
      cmd: [...cmdRest, ...cmds],
      toServer: [],
    });
  }

  const [evt, ...evtRest] = acc.evt;

  if (evt) {
    const updatedEvt = updateChild({ now, model: acc.model, evt });
    return updateLoop(now, {
      model: updatedEvt.model,
      cmd: [...cmdRest, ...updatedEvt.cmd],
      eff: Eff.batch([acc.eff, updatedEvt.eff]),
      evt: batchMsgs(evtRest, updatedEvt.evt),
      toServer: batchMsgs(acc.toServer, updatedEvt.toServer),
    });
  }

  return acc;
};

const updateChild = ({
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
}): Output => {
  const ctx = toCtx({ model, ctx: { now } });

  const space = SpaceClient.update({
    ctx: ctx,
    model: model.space,
    msg: msg?.t === "space" ? msg.c : null,
    fromServer: fromServer?.t === "space" ? fromServer.c : null,
    evt: evt,
    cmd: null,
  });

  const profile = ProfileClient.update({
    ctx: { ...ctx, viewBottomBar: null },
    model: model.profile,
    msg: msg?.t === "profile" ? msg.c : null,
    fromServer: fromServer?.t === "profile" ? fromServer.c : null,
    evt: evt,
    cmd: cmd?.t === "profile" ? cmd : null,
  });

  const auth = AuthClient.update({
    ctx: ctx,
    model: model.auth,
    msg: msg?.t === "auth" ? msg.c : null,
    fromServer: fromServer?.t === "auth" ? fromServer.c : null,
    evt: evt,
    cmd: null,
  });

  const routing = Routing.update({
    model: model.routing,
    msg: msg?.t === "routing" ? msg.c : null,
    cmd: cmd?.t === "routing" ? cmd : null,
  });

  const wire = Wire.update({
    model: model.wire,
    msg: msg?.t === "wire" ? msg.c : null,
    fromServer: fromServer?.t === "wire" ? fromServer.c : null,
    cmd: cmd?.t === "wire" ? cmd : null,
    transport,
  });

  const sound = Sound.update({
    model: model.sound,
    msg: msg?.t === "sound" ? msg.c : null,
    cmd: cmd?.t === "sound" ? cmd : null,
    ctx: null,
  });

  const platform = Platform.update({
    model: model.platform,
    msg: msg?.t === "platform" ? msg.c : null,
    cmd: cmd?.t === "platform" ? cmd : null,
  });

  const statusBar = StatusBar.update({
    model: model.statusBar,
    msg: msg?.t === "status-bar" ? msg.c : null,
  });

  const toast = Toast.update({
    model: model.toast,
    msg: msg?.t === "toast" ? msg.c : null,
    cmd: cmd?.t === "toast" ? cmd : null,
    ctx: ctx,
  });

  const modelNew: ClientModel = {
    auth: auth.model,
    platform: platform.model,
    profile: profile.model,
    routing: routing.model,
    sound: sound.model,
    space: space.model,
    statusBar: statusBar.model,
    toast: toast.model,
    wire: wire.model,
  };

  const effNew = Eff.batch<ClientMsg>([
    Eff.t("auth", auth.eff),
    Eff.t("platform", platform.eff),
    Eff.t("profile", profile.eff),
    Eff.t("routing", routing.eff),
    Eff.t("sound", sound.eff),
    Eff.t("space", space.eff),
    Eff.t("status-bar", statusBar.eff),
    Eff.t("toast", toast.eff),
    Eff.t("wire", wire.eff),
  ]);

  const evtNew = batchMsgs<ClientEvt>(
    auth.evt,
    profile.evt,
    routing.evt,
    sound.evt,
    space.evt,
    toast.evt,
    wire.evt
  );

  const cmdNew = batchMsgs<
    ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>
  >(
    ClientCmd.tag("auth", auth.cmd),
    ClientCmd.tag("profile", profile.cmd),
    ClientCmd.tag("space", space.cmd),
    routing.cmd,
    sound.cmd,
    toast.cmd
  );

  const toServerNew = batchMsgs<ToServer>(
    space.toServer?.map((c) => ({ t: "space", c })),
    profile.toServer?.map((c) => ({ t: "profile", c })),
    auth.toServer?.map((c) => ({ t: "auth", c }))
  );

  return {
    model: modelNew,
    eff: effNew,
    cmd: cmdNew,
    evt: evtNew,
    toServer: toServerNew,
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
      return <LogoScreen />;
    }
  }
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
              )}
            >
              {item.icon}
              <div class="mt-0.5 text-xs">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
