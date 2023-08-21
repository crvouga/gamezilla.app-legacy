import {
  Browser,
  Eff,
  Posix,
  Sub,
  andThen,
  p,
  toMsgPayload,
  toMsgType,
} from "gamezilla/@SHARED/core";
import {
  AnonymousViewCtx,
  ClientAppMsg,
  ClientCtx,
  Route,
  ViewCtx,
} from "gamezilla/app/@SHARED/client";
import {
  IconGamepad,
  IconUserCircle,
  LoadingScreen,
  VDom,
  cn,
} from "gamezilla/app/@SHARED/ui";
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
  eff: Eff<Msg>;
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
    eff: Eff.batch<Msg>([routing.eff, Eff.t("auth", auth.eff)]),
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
  sendToServer: (m: ToServer) => Eff;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  const updated = update_(input);

  const appMsgs = updated.msgs ?? [];

  if (appMsgs.length > 0) {
    console.log(
      " ",
      ...appMsgs.map((m) => [toMsgType(m), toMsgPayload(m, {})])
    );
  }

  const output = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen((model) => updateFromEvent({ ...input, model, msg }))
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
  sendToServer: (m: ToServer) => Eff;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
  msgs?: ClientAppMsg[];
} => {
  const ctx = toCtx({ model, now });

  switch (msg.t) {
    case "▶": {
      return updateFromServer({ now, sendToServer, msg: msg.c, model });
    }

    case "auth": {
      const updated = AuthClient.update({
        route: model.routing,
        sendToServer: (c) => sendToServer({ t: "auth", c }),
        msg: msg.c,
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        eff: Eff.t("auth", updated.eff),
        msgs: updated.msgs,
      };
    }

    case "toast": {
      const updated = Toast.update(model.toast, msg.c);
      return {
        model: { ...model, toast: updated.model },
        eff: Eff.t("toast", updated.eff),
      };
    }

    case "routing": {
      const updated = Routing.update({ msg: msg.c, model: model.routing });

      return {
        model: { ...model, routing: updated.model },
        eff: Eff.t("routing", updated.eff),
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
        eff: Eff.t("space", updated.eff ?? Eff.None),
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
        eff: Eff.t("profile", updated.eff),
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
        sendToServer: (m) => sendToServer({ t: "search", c: m }),
      });
      return {
        model: { ...model, search: updated.model },
        eff: Eff.t("search", updated.eff),
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
  sendToServer: (m: ToServer) => Eff;
  msg: ToClient;
  model: Model;
  now: Posix;
}): {
  model: Model;
  eff?: Eff<Msg>;
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
        eff: Eff.t("auth", updated.eff),
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
        eff: Eff.t("space", updated.eff),
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
        eff: Eff.t("profile", updated.eff),
      };
    }

    case "access-denied": {
      return { model };
    }
  }
};

const updateFromEvent = ({
  model,
  msg,
  sendToServer,
  now,
}: {
  now: Posix;
  model: Model;
  msg: ClientAppMsg;
  sendToServer: (m: ToServer) => Eff;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  const ctx = toCtx({ model, now });

  const chat = ChatClient.updateFromEvent({
    model: model.chat,
    msg,
    sendToServer: (c) => sendToServer({ t: "chat", c }),
  });

  const space = SpaceClient.updateFromEvent({
    model: model.space,
    msg,
    sendToServer: (c) => sendToServer({ t: "space", c }),
  });

  const profile = ProfileClient.updateFromEvent({
    model: model.profile,
    msg,
    ctx,
    sendToServer: (c) => sendToServer({ t: "profile", c }),
  });

  const auth = AuthClient.updateFromEvent({
    model: model.auth,
    msg,
  });

  const routing = Routing.updateFromEvent({
    model: model.routing,
    msg,
  });

  const toast = Toast.updateFromCmd({
    model: model.toast,
    msg,
  });

  const wire = Wire.updateFromEvent({
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
    eff: Eff.batch<Msg>([
      Eff.t("routing", routing.eff),
      Eff.t("chat", chat.eff),
      Eff.t("profile", profile.eff),
      Eff.t("space", space.eff),
      Eff.t("wire", wire.eff),
      Eff.t("toast", toast.eff),
      Eff.t("auth", auth.eff),
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
    <div className="fixed left-1/2 top-1/2 mx-auto  flex h-full max-h-full w-full max-w-md -translate-x-1/2 -translate-y-1/2 touch-none select-none flex-col overflow-hidden border border-neutral-800 bg-black text-white">
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
    return <LogoScreen />;
  }

  if (model.auth.currentUser.t === "loading") {
    return <LogoScreen />;
  }

  if (model.auth.currentUser.t === "logged-out") {
    return (
      <ViewLoggedOut
        dispatch={dispatch}
        model={model}
        ctx={{
          now,
          profiles: model.profile.profiles,
          back: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
          push: (route) =>
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
        push: (route) =>
          dispatch({ t: "routing", c: { t: "clicked-link", route } }),
        back: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
      }}
    />
  );
};

const LogoScreen = () => {
  return (
    <div className="flex h-full w-full items-center justify-center text-8xl">
      🦕
    </div>
  );
};

const ViewLoggedOut = ({
  model,
  ctx,
  dispatch,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
  ctx: AnonymousViewCtx;
}) => {
  if (model.routing.t === "auth") {
    return (
      <AuthClient.ViewLoggedOut
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        model={model.auth}
        ctx={ctx}
        route={model.routing.c}
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
  if (model.routing.t === "chat") {
    return (
      <ChatClient.View
        dispatch={(m) => dispatch({ t: "chat", c: m })}
        model={model.chat}
        ctx={ctx}
        route={model.routing.c}
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

  if (model.routing.t === "space") {
    return (
      <SpaceClient.View
        dispatch={(m) => dispatch({ t: "space", c: m })}
        model={model.space}
        ctx={ctx}
        route={model.routing.c}
        viewBottomBar={
          <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
        }
      />
    );
  }

  if (model.routing.t === "profile") {
    return (
      <ProfileClient.View
        dispatch={(m) => dispatch({ t: "profile", c: m })}
        model={model.profile}
        ctx={ctx}
        route={model.routing.c}
        viewBottomBar={
          <ViewBottomBar model={model} dispatch={dispatch} ctx={ctx} />
        }
      />
    );
  }

  if (model.routing.t === "auth") {
    return (
      <AuthClient.ViewLoggedIn
        dispatch={(m) => dispatch({ t: "auth", c: m })}
        ctx={ctx}
        model={model.auth}
      />
    );
  }

  if (model.routing.t === "search") {
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

  if (model.routing.t === "logout") {
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
      <div className="flex w-full items-center justify-center border-t border-neutral-700">
        {items.map((item) => {
          const isSelected = Route.eq(model.routing, item.route);
          return (
            <button
              key={Route.encode(item.route)}
              onClick={() => ctx.push(item.route)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center pb-2 pt-1",
                isSelected ? "text-blue-500" : "opacity-80"
              )}>
              {item.icon}
              <div className="mt-0.5 text-xs">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
