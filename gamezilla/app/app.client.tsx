import {
  Browser,
  Cmd,
  Posix,
  Sub,
  andThen,
  p,
  toMsgPayload,
  toMsgType,
} from "gamezilla/@/core";
import {
  ClientAppMsg,
  ClientCtx,
  Route,
  UnauthenticatedViewCtx,
  ViewCtx,
} from "gamezilla/app/@";
import {
  IconGamepad,
  IconUserCircle,
  LoadingScreen,
  VDom,
  cn,
} from "gamezilla/app/@/ui";
import { Routing, Toast, Wire } from "./app-client";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./app.core";
import { AuthClient } from "./auth";
import { ChatClient } from "./chat";
import { ProfileClient } from "./profile";
import { SearchClient } from "./search";
import { SpaceClient } from "./space";

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
  const routing = Routing.init(location);
  const toast = Toast.init;
  const wire = Wire.init;
  const auth = AuthClient.init;
  const space = SpaceClient.init;
  const profile = ProfileClient.init;
  const chat = ChatClient.init;
  const search = SearchClient.init;

  return {
    model: {
      routing: routing.model,
      toast,
      wire,
      //
      chat,
      space: space.model,
      auth: auth.model,
      search: search.model,
      profile,
    },
    cmd: Cmd.batch<Msg>([routing.cmd, Cmd.t("auth", auth.cmd)]),
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

//
//
//
// Update
//
//
//

export const update = (input: {
  now: Posix;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = update_(input);

  const appMsgs = updated.msgs ?? [];

  if (appMsgs.length > 0) {
    console.log(
      "appMsgs",
      ...appMsgs.map((m) => [toMsgType(m), toMsgPayload(m, {})])
    );
  }

  const output = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen((model) => updateFromApp({ ...input, model, msg }))
      ),
    updated
  );

  return output;
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
  msgs?: ClientAppMsg[];
} => {
  const ctx = toCtx({ model, now });

  switch (msg.t) {
    case "▶": {
      return updateFromServer({ now, sendToServer, msg: msg.c, model });
    }

    case "auth": {
      const updated = AuthClient.update({
        route: model.routing.route,
        sendToServer: (c) => sendToServer({ t: "auth", c }),
        msg: msg.c,
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.t("auth", updated.cmd),
        msgs: updated.msgs,
      };
    }

    case "toast": {
      const updated = Toast.update(model.toast, msg.c);
      return {
        model: { ...model, toast: updated.model },
        cmd: Cmd.t("toast", updated.cmd),
      };
    }

    case "routing": {
      const updated = Routing.update({ msg: msg.c, model: model.routing });

      return {
        model: { ...model, routing: updated.model },
        cmd: Cmd.t("routing", updated.cmd),
        msgs: updated.msgs,
      };
    }

    case "wire": {
      const updated = Wire.update({
        msg: msg.c,
        model: model.wire,
      });
      return { model: { ...model, wire: updated.model }, msgs: updated.msgs };
    }

    case "space": {
      if (!ctx) {
        return { model };
      }
      const updated = SpaceClient.update({
        ctx: ctx,
        sendToServer: (m) => sendToServer({ t: "space", c: m }),
        msg: msg.c,
        model: model.space,
      });

      return {
        model: { ...model, space: updated.model },
        cmd: Cmd.t("space", updated.cmd ?? Cmd.None),
        msgs: updated.msgs,
      };
    }

    case "profile": {
      const updated = ProfileClient.update({
        msg: msg.c,
        model: model.profile,
        sendToServer: (m) => sendToServer({ t: "profile", c: m }),
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.t("profile", updated.cmd),
      };
    }

    case "chat": {
      const updated = ChatClient.update({ msg: msg.c, model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.t("chat", updated?.cmd ?? Cmd.None),
      };
    }

    case "search": {
      const updated = SearchClient.update({
        msg: msg.c,
        model: model.search,
        sendToServer: (m) => sendToServer({ t: "search", c: m }),
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.t("search", updated.cmd),
      };
    }
  }
};

const toCtx = (input: { model: Model; now: Posix }): ClientCtx | null => {
  if (input.model.auth.currentUser.t === "logged-in") {
    return {
      currentUserId: input.model.auth.currentUser.userId,
      profiles: input.model.profile.profiles,
      now: input.now,
    };
  }
  return null;
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
  msgs?: ClientAppMsg[];
} => {
  const ctx = toCtx({ model, now });

  switch (msg.t) {
    case "auth": {
      const updated = AuthClient.updateFromServer({
        msg: msg.c,
        model: model.auth,
      });
      return {
        ...updated,
        model: { ...model, auth: updated.model },
        cmd: Cmd.t("auth", updated.cmd),
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
        cmd: Cmd.t("search", updated.cmd),
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
        cmd: Cmd.t("chat", updated.cmd),
      };
    }

    case "space": {
      if (!ctx) {
        return { model };
      }
      const updated = SpaceClient.updateFromServer({
        ctx,
        sendToServer: (msg) => sendToServer({ t: "space", c: msg }),
        msg: msg.c,
        model: model.space,
      });

      return {
        ...updated,
        model: { ...model, space: updated.model },
        cmd: Cmd.t("space", updated.cmd),
      };
    }

    case "profile": {
      const updated = ProfileClient.updateFromServer({
        msg: msg.c,
        model: model.profile,
      });
      return {
        ...updated,
        model: { ...model, profile: updated.model },
        cmd: Cmd.t("profile", updated.cmd),
      };
    }

    case "access-denied": {
      return { model };
    }
  }
};

export const updateFromApp = ({
  model,
  msg,
  sendToServer,
  now,
}: {
  now: Posix;
  model: Model;
  msg: ClientAppMsg;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const ctx = toCtx({ model, now });

  const chat = ChatClient.updateFromApp({
    model: model.chat,
    msg,
    sendToServer: (c) => sendToServer({ t: "chat", c }),
  });

  const space = SpaceClient.updateFromApp({
    model: model.space,
    msg,
    sendToServer: (c) => sendToServer({ t: "space", c }),
  });

  const profile = ProfileClient.updateFromApp({
    model: model.profile,
    msg,
    ctx,
    sendToServer: (c) => sendToServer({ t: "profile", c }),
  });

  const auth = AuthClient.updateFromApp({
    model: model.auth,
    msg,
  });

  const routing = Routing.updateFromApp({
    model: model.routing,
    msg,
  });

  const toast = Toast.updateFromApp({
    model: model.toast,
    msg,
  });

  const wire = Wire.updateFromApp({
    model: model.wire,
    msg,
    sendToServer,
  });

  return {
    model: {
      ...model,
      routing: routing.model,
      toast: toast.model,
      chat: chat.model,
      profile: profile.model,
      space: space.model,
      wire: wire.model,
      auth: auth.model,
    },
    cmd: Cmd.batch<Msg>([
      Cmd.t("routing", routing.cmd),
      Cmd.t("chat", chat.cmd),
      Cmd.t("profile", profile.cmd),
      Cmd.t("space", space.cmd),
      Cmd.t("wire", wire.cmd),
      Cmd.t("toast", toast.cmd),
      Cmd.t("auth", auth.cmd),
    ]),
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

export const onWireMsg = Sub.create<Wire.Msg>();
export const onServerMsg = Sub.create<ToClient>();

export const subscriptions = ({
  now,
  model,
}: {
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  return Sub.batch<Msg>([
    Sub.tag("▶", onServerMsg),
    Sub.tag("wire", onWireMsg),
    Sub.tag("routing", Routing.subscriptions),
    Sub.tag("auth", AuthClient.subscriptions),
    spaceSub(now, model),
  ]);
};

const spaceSub = (now: Posix, model: Model): Sub<Msg> => {
  if (model.auth.currentUser.t === "logged-in") {
    return Sub.tag(
      "space",
      SpaceClient.subscriptions(
        {
          now,
          currentUserId: model.auth.currentUser.userId,
          profiles: model.profile.profiles,
        },
        model.space
      )
    );
  }

  return Sub.None;
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
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div className="fixed left-1/2 top-1/2 mx-auto flex h-full max-h-full w-full max-w-md -translate-x-1/2 -translate-y-1/2 touch-none select-none flex-col overflow-hidden border border-neutral-800 bg-black text-white">
      <ViewMain model={model} now={now} dispatch={dispatch} />

      <Wire.View model={model.wire} />

      <Toast.View
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
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  if (model.wire.t === "server-disconnected") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Server disconnected. Try refreshing the page.</p>
      </div>
    );
  }

  if (model.auth.currentUser.t === "not-asked") {
    return <LoadingScreen />;
  }

  if (model.auth.currentUser.t === "loading") {
    return <LoadingScreen />;
  }
  if (model.auth.currentUser.t === "logged-out") {
    return (
      <ViewLoggedOut
        dispatch={dispatch}
        model={model}
        ctx={{
          now,
          profiles: model.profile.profiles,
          onBack: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
          onPush: (route) =>
            dispatch({
              t: "routing",
              c: { t: "clicked-link", route },
            }),
        }}
      />
    );
  }

  return (
    <ViewLoggedIn
      model={model}
      dispatch={dispatch}
      ctx={{
        now,
        currentUserId: model.auth.currentUser.userId,
        profiles: model.profile.profiles,
        onPush: (route) =>
          dispatch({ t: "routing", c: { t: "clicked-link", route } }),
        onBack: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
      }}
    />
  );
};

const ViewLoggedOut = ({
  model,
  ctx,
  dispatch,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
  ctx: UnauthenticatedViewCtx;
}) => {
  if (model.routing.route.t === "auth") {
    return (
      <AuthClient.ViewLoggedOut
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        model={model.auth}
        ctx={ctx}
        route={model.routing.route.c}
      />
    );
  }

  return (
    <AuthClient.ViewLoggedOut
      dispatch={(m) => dispatch({ t: "auth", c: m })}
      model={model.auth}
      ctx={ctx}
      route={{ t: "login" }}
    />
  );
};

const ViewLoggedIn = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: ViewCtx;
  model: Model;
  dispatch: (m: Msg) => void;
}) => {
  if (model.routing.route.t === "chat") {
    return (
      <ChatClient.View
        dispatch={(m) => dispatch({ t: "chat", c: m })}
        model={model.chat}
        ctx={ctx}
        route={model.routing.route.c}
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

  if (model.routing.route.t === "space") {
    return (
      <SpaceClient.View
        dispatch={(m) => dispatch({ t: "space", c: m })}
        model={model.space}
        ctx={ctx}
        route={model.routing.route.c}
        viewBottomBar={
          <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
        }
      />
    );
  }

  if (model.routing.route.t === "profile") {
    return (
      <ProfileClient.View
        dispatch={(m) => dispatch({ t: "profile", c: m })}
        model={model.profile}
        ctx={ctx}
        route={model.routing.route.c}
        viewBottomBar={
          <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
        }
      />
    );
  }

  if (model.routing.route.t === "auth") {
    return (
      <AuthClient.ViewLoggedIn
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        ctx={ctx}
        model={model.auth}
      />
    );
  }

  if (model.routing.route.t === "search") {
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

  if (model.routing.route.t === "logout") {
    return (
      <AuthClient.ViewLogoutScreen
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        ctx={ctx}
        model={model.auth}
      />
    );
  }

  return <LoadingScreen />;
};

const ViewBottomBar = ({
  model,
  dispatch,
  ctx,
}: {
  ctx: ViewCtx;
  model: Model;
  dispatch: (m: Msg) => void;
}) => {
  const items: {
    route: Route;
    label: string;
    icon: VDom;
  }[] = [
    {
      route: {
        t: "space",
        c: { t: "game-space-list" },
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
      <div className="flex w-full items-center justify-center border-t border-neutral-700">
        {items.map((item) => {
          const isSelected = Route.eq(model.routing.route, item.route);
          return (
            <button
              key={Route.encode(item.route)}
              onClick={() => ctx.onPush(item.route)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 pb-2 pt-1",
                isSelected ? "text-blue-500" : "opacity-80"
              )}>
              {item.icon}
              <div className="text-xs">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
