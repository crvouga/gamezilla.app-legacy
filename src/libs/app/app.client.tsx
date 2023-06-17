import { AuthClient } from "@gamezilla/feat/auth";
import { ChatClient } from "@gamezilla/feat/chat";
import { ProfileClient } from "@gamezilla/feat/profile";
import { RoomClient } from "@gamezilla/feat/room";
import { SearchClient } from "@gamezilla/feat/search";
import {
  AppMsg,
  Ctx,
  Route,
  UnauthenticatedViewCtx,
  ViewCtx,
} from "@gamezilla/shared/client";
import { Browser, Cmd, Posix, Sub, exhaustive } from "@gamezilla/shared/core";
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
  const room = RoomClient.init();
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
      room: room.model,
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
}): { model: Model; cmd?: Cmd<Msg> } => {
  const updated = update_(input);

  const appUpdated = (updated?.msgs ?? []).reduce<{
    model: Model;
    cmd?: Cmd<Msg>;
  }>((acc, msg) => {
    const appUpdated = updateFromApp({
      ...input,
      model: acc.model,
      msg,
    });

    return {
      model: appUpdated.model,
      cmd: Cmd.batch([acc.cmd, appUpdated.cmd]),
    };
  }, updated);

  return appUpdated;
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
  msgs?: AppMsg[];
} => {
  switch (msg.t) {
    case "→": {
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
        cmd: Cmd.tag_("auth", updated.cmd),
        msgs: AppMsg.tag("auth", updated.msgs),
      };
    }

    case "toast": {
      const updated = Toast.update({ msg: msg.c, model: model.toast });
      return {
        model: { ...model, toast: updated.model },
        cmd: Cmd.tag_("toast", updated.cmd),
      };
    }

    case "routing": {
      const updated = Routing.update({
        msg: msg.c,
        model: model.routing,
      });

      return {
        model: {
          ...model,
          routing: updated.model,
        },
        cmd: Cmd.tag_("routing", updated.cmd),
        msgs: AppMsg.tag("routing", updated.msgs),
      };
    }

    case "wire": {
      const updated = Wire.update({
        msg: msg.c,
        model: model.wire,
      });
      return { model: { ...model, wire: updated.model }, msgs: updated.msgs };
    }

    case "room": {
      if (model.auth.currentUser.t !== "logged-in") {
        return { model };
      }

      const ctx: Ctx = {
        currentUserId: model.auth.currentUser.currentUserId,
        profiles: model.profile.profiles,
        now,
      };

      const updated = RoomClient.update({
        ctx: ctx,
        sendToServer: (m) => sendToServer({ t: "room", c: m }),
        msg: msg.c,
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_("room", updated.cmd ?? Cmd.None),
        msgs: AppMsg.tag("room", updated.msgs),
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
        cmd: Cmd.tag_("profile", updated.cmd),
      };
    }

    case "chat": {
      const updated = ChatClient.update({ msg: msg.c, model: model.chat });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_("chat", updated?.cmd ?? Cmd.None),
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
        cmd: Cmd.tag_("search", updated.cmd),
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
  msgs?: AppMsg[];
} => {
  switch (msg.t) {
    case "room": {
      if (model.auth.currentUser.t !== "logged-in") {
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
        sendToServer: (msg) => sendToServer({ t: "room", c: msg }),
        msg: msg.c,
        model: model.room,
      });

      return {
        model: { ...model, room: updated.model },
        cmd: Cmd.tag_("room", updated.cmd ?? Cmd.None),
        msgs: updated.msgs,
      };
    }

    case "profile": {
      const updated = ProfileClient.updateFromServer({
        msg: msg.c,
        model: model.profile,
      });
      return {
        model: { ...model, profile: updated.model },
        cmd: Cmd.tag_("profile", updated.cmd),
      };
    }

    case "search": {
      const updated = SearchClient.updateFromServer({
        msg: msg.c,
        model: model.search,
      });
      return {
        model: { ...model, search: updated.model },
        cmd: Cmd.tag_("search", updated.cmd),
      };
    }

    case "auth": {
      const updated = AuthClient.updateFromServer({
        msg: msg.c,
        model: model.auth,
      });
      return {
        model: { ...model, auth: updated.model },
        cmd: Cmd.tag_("auth", updated.cmd),
      };
    }

    case "chat": {
      const updated = ChatClient.updateFromServer({
        msg: msg.c,
        model: model.chat,
      });
      return {
        model: { ...model, chat: updated.model },
        cmd: Cmd.tag_("chat", updated.cmd),
      };
    }

    case "access-denied": {
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
    sendToServer: (c) => sendToServer({ t: "chat", c }),
  });

  const room = RoomClient.updateFromApp({
    model: model.room,
    msg,
    sendToServer: (c) => sendToServer({ t: "room", c }),
  });

  const profile = ProfileClient.updateFromApp({
    model: model.profile,
    msg,
    sendToServer: (c) => sendToServer({ t: "profile", c }),
  });

  const auth = AuthClient.updateFromApp({
    model: model.auth,
    msg,
    route: model.routing.route,
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
      toast: toast.model,
      chat: chat.model,
      profile: profile.model,
      room: room.model,
      wire: wire.model,
      auth: auth.model,
    },
    cmd: Cmd.batch<Msg>([
      () => {
        console.log("[app-msg]", msg);
      },
      Cmd.tag_("chat", chat.cmd),
      Cmd.tag_("profile", profile.cmd),
      Cmd.tag_("room", room.cmd),
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
    roomSub(now, model),
  ]);
};

const roomSub = (now: Posix, model: Model): Sub<Msg> => {
  if (model.auth.currentUser.t === "logged-in") {
    return Sub.tag_(
      "room",
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
      {model.auth.currentUser.t === "not-asked" && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12 animate-spin" />
        </div>
      )}

      {model.auth.currentUser.t === "loading" && (
        <div className="w-full h-full flex items-center justify-center">
          <IconSpinner className="w-12 h-12 animate-spin" />
        </div>
      )}

      {model.auth.currentUser.t === "logged-out" && (
        <ViewLoggedOut
          $send={$send}
          model={model}
          ctx={{
            now,
            profiles: model.profile.profiles,
            $back: () => $send({ t: "routing", c: { t: "clicked-back" } }),
            $push: (route) =>
              $send({ t: "routing", c: { t: "clicked-link", c: route } }),
          }}
        />
      )}

      {model.auth.currentUser.t === "logged-in" && (
        <ViewLoggedIn
          model={model}
          $send={$send}
          ctx={{
            now,
            currentUserId: model.auth.currentUser.currentUserId,
            profiles: model.profile.profiles,
            $push: (route) =>
              $send({ t: "routing", c: { t: "clicked-link", c: route } }),
            $back: () => $send({ t: "routing", c: { t: "clicked-back" } }),
          }}
        />
      )}

      <Wire.View model={model.wire} />

      <Toast.View model={model.toast} $send={(c) => $send({ t: "toast", c })} />
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
  if (model.routing.route.t === "auth") {
    return (
      <AuthClient.ViewLoggedOut
        $send={(m) => $send({ t: "auth", c: m })}
        model={model.auth}
        ctx={ctx}
        route={model.routing.route.c}
      />
    );
  }

  return (
    <AuthClient.ViewLoggedOut
      $send={(m) => $send({ t: "auth", c: m })}
      model={model.auth}
      ctx={ctx}
      route={{ t: "login" }}
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
  if (model.routing.route.t === "chat") {
    return (
      <ChatClient.View
        $send={(m) => $send({ t: "chat", c: m })}
        model={model.chat}
        ctx={ctx}
        route={model.routing.route.c}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
        userSearch={{
          loading: model.profile.requests.search?.t === "loading",
          onInput: (query) => {
            $send({
              t: "profile",
              c: { t: "search", query },
            });
          },
        }}
      />
    );
  }

  if (model.routing.route.t === "room") {
    return (
      <RoomClient.View
        $send={(m) => $send({ t: "room", c: m })}
        model={model.room}
        ctx={ctx}
        route={model.routing.route.c}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  if (model.routing.route.t === "profile") {
    return (
      <ProfileClient.View
        $send={(m) => $send({ t: "profile", c: m })}
        model={model.profile}
        ctx={ctx}
        route={model.routing.route.c}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  if (model.routing.route.t === "auth") {
    return (
      <AuthClient.ViewLoggedIn
        $send={(m) => $send({ t: "auth", c: m })}
        ctx={ctx}
        model={model.auth}
      />
    );
  }

  if (model.routing.route.t === "search") {
    return (
      <SearchClient.View
        $send={(m) => $send({ t: "search", c: m })}
        model={model.search}
        viewBottomBar={<ViewBottomBar model={model} $send={$send} ctx={ctx} />}
      />
    );
  }

  if (model.routing.route.t === "logout") {
    return (
      <AuthClient.ViewLogoutScreen
        $send={(m) => $send({ t: "auth", c: m })}
        ctx={ctx}
        model={model.auth}
      />
    );
  }

  return <LoadingScreen />;
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
    route: Route;
    label: string;
    icon: VDom;
  }[] = [
    {
      route: {
        t: "room",
        c: { t: "room-list" },
      },
      label: "Rooms",
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
    <div className="w-full flex flex-col items-center justify-center">
      <RoomClient.ViewCurrentRoomBar
        ctx={ctx}
        model={model.room}
        $send={(c) => $send({ t: "room", c })}
      />
      <div className="w-full flex items-center justify-center border-t border-neutral-600">
        {items.map((item) => {
          const isSelected = Route.eq(model.routing.route, item.route);
          return (
            <button
              key={Route.encode(item.route)}
              onClick={() => ctx.$push(item.route)}
              className={cn(
                "flex items-center justify-center flex-col flex-1 pt-1 pb-2 gap-0.5",
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
