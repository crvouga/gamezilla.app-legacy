import { AuthClient } from "@gamezilla/feat/auth";
import { ChatClient } from "@gamezilla/feat/chat";
import { ProfileClient } from "@gamezilla/feat/profile";
import { SearchClient } from "@gamezilla/feat/search";
import { GameSpaceClient } from "src/libs/feat/game-space";
import {
  ClientAppMsg,
  Ctx,
  Route,
  UnauthenticatedViewCtx,
  ViewCtx,
} from "@gamezilla/shared/client";
import { Browser, Cmd, Posix, Sub, andThen, p } from "@gamezilla/shared/core";
import {
  IconGamepad,
  IconMagnifyingGlass,
  IconSpinner,
  IconUserCircle,
  LoadingScreen,
  VDom,
  cn,
} from "@gamezilla/shared/ui";
import { Subject } from "rxjs";
import { Routing, Toast, Wire } from "./app-client";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./app.shared";

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
  //
  const auth = AuthClient.init();
  const space = GameSpaceClient.init;
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
      gameSpace: space.model,
      auth: auth.model,
      search: search.model,
      profile,
    },
    cmd: Cmd.batch<Msg>([routing.cmd, Cmd.tag_("auth", auth.cmd)]),
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

  const output = appMsgs.reduce(
    (acc, msg) =>
      p(
        acc,
        andThen(({ model }) => updateFromApp({ ...input, model, msg }))
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

  if (msg.t === "→") {
    return updateFromServer({ now, sendToServer, msg: msg.c, model });
  }

  if (msg.t === "auth") {
    const updated = AuthClient.update({
      route: model.routing.route,
      sendToServer: (c) => sendToServer({ t: "auth", c }),
      msg: msg.c,
      model: model.auth,
    });
    return {
      model: { ...model, auth: updated.model },
      cmd: Cmd.tag_("auth", updated.cmd),
      msgs: ClientAppMsg.tag("auth", updated.msgs),
    };
  }

  if (msg.t === "toast") {
    const updated = Toast.update({ msg: msg.c, model: model.toast });
    return {
      model: { ...model, toast: updated.model },
      cmd: Cmd.tag_("toast", updated.cmd),
    };
  }

  if (msg.t === "routing") {
    const updated = Routing.update({
      msg: msg.c,
      model: model.routing,
    });

    return {
      model: { ...model, routing: updated.model },
      cmd: Cmd.tag_("routing", updated.cmd),
      msgs: ClientAppMsg.tag("routing", updated.msgs),
    };
  }

  if (msg.t === "wire") {
    const updated = Wire.update({
      msg: msg.c,
      model: model.wire,
    });
    return { model: { ...model, wire: updated.model }, msgs: updated.msgs };
  }

  if (msg.t === "game-space") {
    const updated = GameSpaceClient.update({
      ctx: ctx,
      sendToServer: (m) => sendToServer({ t: "game-space", c: m }),
      msg: msg.c,
      model: model.gameSpace,
    });

    return {
      model: { ...model, gameSpace: updated.model },
      cmd: Cmd.tag_("game-space", updated.cmd ?? Cmd.None),
      msgs: ClientAppMsg.tag("game-space", updated.msgs),
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileClient.update({
      msg: msg.c,
      model: model.profile,
      sendToServer: (m) => sendToServer({ t: "profile", c: m }),
    });
    return {
      model: { ...model, profile: updated.model },
      cmd: Cmd.tag_("profile", updated.cmd),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatClient.update({ msg: msg.c, model: model.chat });
    return {
      model: { ...model, chat: updated.model },
      cmd: Cmd.tag_("chat", updated?.cmd ?? Cmd.None),
    };
  }

  if (msg.t === "search") {
    const updated = SearchClient.update({
      msg: msg.c,
      model: model.search,
      sendToServer: (m) => sendToServer({ t: "search", c: m }),
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.tag_("search", updated.cmd),
    };
  }

  return { model };
};

const toCtx = (input: { model: Model; now: Posix }): Ctx | null => {
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

  if (msg.t === "auth") {
    const updated = AuthClient.updateFromServer({
      msg: msg.c,
      model: model.auth,
    });
    return {
      model: { ...model, auth: updated.model },
      cmd: Cmd.tag_("auth", updated.cmd),
    };
  }

  if (msg.t === "search") {
    const updated = SearchClient.updateFromServer({
      msg: msg.c,
      model: model.search,
    });
    return {
      model: { ...model, search: updated.model },
      cmd: Cmd.tag_("search", updated.cmd),
    };
  }

  if (msg.t === "chat") {
    const updated = ChatClient.updateFromServer({
      msg: msg.c,
      model: model.chat,
    });
    return {
      model: { ...model, chat: updated.model },
      cmd: Cmd.tag_("chat", updated.cmd),
    };
  }

  if (msg.t === "game-space") {
    const updated = GameSpaceClient.updateFromServer({
      ctx,
      sendToServer: (msg) => sendToServer({ t: "game-space", c: msg }),
      msg: msg.c,
      model: model.gameSpace,
    });

    return {
      model: { ...model, gameSpace: updated.model },
      cmd: Cmd.tag_("game-space", updated.cmd ?? Cmd.None),
      msgs: updated.msgs,
    };
  }

  if (msg.t === "profile") {
    const updated = ProfileClient.updateFromServer({
      msg: msg.c,
      model: model.profile,
    });
    return {
      model: { ...model, profile: updated.model },
      cmd: Cmd.tag_("profile", updated.cmd),
    };
  }

  return { model };
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

  const space = GameSpaceClient.updateFromApp({
    model: model.gameSpace,
    msg,
    sendToServer: (c) => sendToServer({ t: "game-space", c }),
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
      gameSpace: space.model,
      wire: wire.model,
      auth: auth.model,
    },
    cmd: Cmd.batch<Msg>([
      Cmd.tag_("routing", routing.cmd),
      Cmd.tag_("chat", chat.cmd),
      Cmd.tag_("profile", profile.cmd),
      Cmd.tag_("game-space", space.cmd),
      Cmd.tag_("wire", wire.cmd),
      Cmd.tag_("toast", toast.cmd),
      Cmd.tag_("auth", auth.cmd),
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

export const wireMsgs = new Subject<Wire.Msg>();
export const fromServerMsgs = new Subject<ToClient>();

export const subscriptions = ({
  now,
  model,
}: {
  now: Posix;
  model: Model;
}): Sub<Msg> => {
  return Sub.batch<Msg>([
    Sub.tag_("→", fromServerMsgs),
    Sub.tag_("wire", wireMsgs),
    Sub.tag_("routing", Routing.subscriptions),
    Sub.tag_("auth", AuthClient.subscriptions),
    spaceSub(now, model),
  ]);
};

const spaceSub = (now: Posix, model: Model): Sub<Msg> => {
  if (model.auth.currentUser.t === "logged-in") {
    return Sub.tag_(
      "game-space",
      GameSpaceClient.subscriptions(
        {
          now,
          currentUserId: model.auth.currentUser.userId,
          profiles: model.profile.profiles,
        },
        model.gameSpace
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
  isTimeTravelDebugging: boolean;
  now: Posix;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div className="fixed left-1/2 top-1/2 mx-auto flex h-full max-h-full w-full max-w-md -translate-x-1/2 -translate-y-1/2 touch-none select-none flex-col overflow-hidden border border-neutral-800 bg-black text-white">
      {model.auth.currentUser.t === "not-asked" && (
        <div className="flex h-full w-full items-center justify-center">
          <IconSpinner className="h-12 w-12 animate-spin" />
        </div>
      )}

      {model.auth.currentUser.t === "loading" && (
        <div className="flex h-full w-full items-center justify-center">
          <IconSpinner className="h-12 w-12 animate-spin" />
        </div>
      )}

      {model.auth.currentUser.t === "logged-out" && (
        <ViewLoggedOut
          dispatch={dispatch}
          model={model}
          ctx={{
            now,
            profiles: model.profile.profiles,
            onBack: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
            onPush: (route) =>
              dispatch({ t: "routing", c: { t: "clicked-link", c: route } }),
          }}
        />
      )}

      {model.auth.currentUser.t === "logged-in" && (
        <ViewLoggedIn
          model={model}
          dispatch={dispatch}
          ctx={{
            now,
            currentUserId: model.auth.currentUser.userId,
            profiles: model.profile.profiles,
            onPush: (route) =>
              dispatch({ t: "routing", c: { t: "clicked-link", c: route } }),
            onBack: () => dispatch({ t: "routing", c: { t: "clicked-back" } }),
          }}
        />
      )}

      <Wire.View model={model.wire} />

      <Toast.View
        model={model.toast}
        dispatch={(c) => dispatch({ t: "toast", c })}
      />
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

  if (model.routing.route.t === "game-space") {
    return (
      <GameSpaceClient.View
        dispatch={(m) => dispatch({ t: "game-space", c: m })}
        model={model.gameSpace}
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
        t: "game-space",
        c: { t: "game-space-list" },
      },
      label: "Spaces",
      icon: <IconGamepad />,
    },
    {
      route: { t: "search" },
      label: "Search",
      icon: <IconMagnifyingGlass />,
    },
    {
      route: { t: "profile", c: { t: "profile", userId: ctx.currentUserId } },
      label: "Profile",
      icon: <IconUserCircle />,
    },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <GameSpaceClient.ViewCurrentSpaceBar
        ctx={ctx}
        model={model.gameSpace}
        dispatch={(c) => dispatch({ t: "game-space", c })}
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
