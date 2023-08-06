import { ProfileAvatar } from "@gamezilla/shared/app";
import {
  ClientAppMsg,
  ClientCtx,
  RouteProfile,
  ViewCtx,
} from "@gamezilla/shared/client";
import { Cmd, andThen, p } from "@gamezilla/core";
import {
  IconChevronRight,
  LoadingScreen,
  MyAvatar,
  Button,
  MyTextField,
  TopBar,
  TopBarBackButton,
  VDom,
} from "@gamezilla/ui";
import { ClientModel, ClientMsg, ToClient, ToServer } from "../profile.core";
import { ViewProfileScreen } from "./view-profile-screen";
import { ViewUpdateAvatarScreen } from "./view-update-avatar-screen";

//
//
//
// model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  profiles: {},
  requests: {},
};

//
//
//
// update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  msg,
  model,
  sendToServer,
}: {
  msg: Msg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "inputted-username") {
    return {
      model: { ...model, draft: { ...model.draft, username: msg.username } },
    };
  }

  if (msg.t === "inputted-avatar-seed") {
    return {
      model: {
        ...model,
        draft: { ...model.draft, avatarSeed: ProfileAvatar.toSeed(msg.seed) },
      },
    };
  }

  if (msg.t === "inputted-avatar-style") {
    return {
      model: {
        ...model,
        draft: { ...model.draft, avatarStyle: msg.style },
      },
    };
  }

  if (msg.t === "clicked-generate-random-seed") {
    return {
      model: {
        ...model,
        draft: {
          ...model.draft,
        },
      },
    };
  }

  return {
    model: {
      ...model,
      requests: {
        ...model.requests,
        [msg.t]: { t: "loading" },
      },
    },
    cmd: sendToServer(msg),
  };
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.result.t === "err") {
    return {
      model: {
        ...model,
        requests: {
          ...model.requests,
          [msg.t]: msg.result,
        },
      },
    };
  }

  const profilesNew = msg.result.value.reduce<Model["profiles"]>(
    (acc, profile) => {
      return {
        ...acc,
        [profile.userId]: profile,
      };
    },
    model.profiles
  );

  const modelNew: Model = {
    ...model,
    profiles: profilesNew,
  };

  return {
    model: modelNew,
  };
};

export const updateFromApp = ({
  msg,
  model,
  sendToServer,
  ctx,
}: {
  msg: ClientAppMsg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd<Msg>;
  ctx: ClientCtx | null;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return p(
    { model },

    andThen((model) => {
      if (msg.t !== "route-changed") {
        return { model };
      }
      const route = msg.route;

      if (route.t !== "profile") {
        return { model };
      }

      if (route.c.t !== "profile") {
        return { model };
      }

      return {
        model,
        cmd: sendToServer({ t: "find-many", userIds: [route.c.userId] }),
      };
    }),
    andThen((model) => updateUsernameDraft({ model, msg, ctx })),

    andThen((model) => {
      if (msg.t === "route-changed") {
        return { model: { ...model, opened: null } };
      }

      if (msg.t === "got-profiles") {
        return {
          model: { ...model, profiles: { ...model.profiles, ...msg.profiles } },
        };
      }

      return { model };
    })
  );
};

const updateUsernameDraft = ({
  model,
  msg,
  ctx,
}: {
  model: Model;
  msg: ClientAppMsg;
  ctx: ClientCtx | null;
}): { model: Model } => {
  if (msg.t !== "route-changed") {
    return { model };
  }
  const route = msg.route;

  if (route.t !== "profile") {
    return { model };
  }

  if (route.c.t !== "profile-update-username") {
    return { model };
  }

  if (!ctx) {
    return { model };
  }

  return {
    model: {
      ...model,
      draft: {
        ...model.draft,
        username: model.profiles[ctx.currentUserId]?.username ?? "",
      },
    },
  };
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
  route,
  dispatch,
  ctx,
  viewBottomBar,
}: {
  ctx: ViewCtx;
  model: Model;
  route: RouteProfile;
  dispatch: (msg: Msg) => void;
  viewBottomBar: VDom;
}) => {
  if (route.t === "profile") {
    return (
      <div className="relative flex h-full w-full flex-col">
        <ViewProfileScreen
          model={model}
          ctx={ctx}
          dispatch={dispatch}
          userId={route.userId}
        />

        {viewBottomBar}
      </div>
    );
  }

  if (route.t === "profile-update") {
    return <ViewUpdateScreen dispatch={dispatch} ctx={ctx} model={model} />;
  }

  if (route.t === "profile-update-username") {
    return (
      <ViewUpdateUsernameScreen dispatch={dispatch} ctx={ctx} model={model} />
    );
  }

  if (route.t === "profile-update-avatar") {
    return (
      <ViewUpdateAvatarScreen dispatch={dispatch} ctx={ctx} model={model} />
    );
  }

  return <LoadingScreen />;
};

const ViewUpdateScreen = ({
  ctx,
}: {
  ctx: ViewCtx;
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  const profile = ctx.profiles[ctx.currentUserId];
  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              ctx.onPush({
                t: "profile",
                c: { t: "profile", userId: ctx.currentUserId },
              })
            }
          />
        }
        title="Update Profile"
      />

      <div className="flex w-full flex-col items-center gap-2 py-2">
        <MyAvatar
          src={profile?.avatarUrl}
          className="h-28 w-28"
          alt="profile avatar"
          onClick={() =>
            ctx.onPush({ t: "profile", c: { t: "profile-update-avatar" } })
          }
        />

        <Button
          size="sm"
          color="primary"
          variant="text"
          className="block"
          onClick={() =>
            ctx.onPush({ t: "profile", c: { t: "profile-update-avatar" } })
          }
          text=" Change Avatar"
        />
      </div>

      <ViewField
        onClick={() =>
          ctx.onPush({ t: "profile", c: { t: "profile-update-username" } })
        }
        label="Username"
        value={profile?.username}
      />
    </div>
  );
};

export const ViewField = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string | null;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-start px-4 py-2">
    <div className="flex flex-1 flex-col items-start">
      <p className="text-sm text-neutral-300">{label}</p>
      {typeof value === "string" ? (
        <p className="h-7 text-lg">{value}</p>
      ) : (
        <div className="flex h-7 w-full items-center ">
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-neutral-600"></div>
        </div>
      )}
    </div>

    <IconChevronRight className="h-6 w-6" />
  </button>
);

const ViewUpdateUsernameScreen = ({
  ctx,
  model,
  dispatch,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
  ctx: ViewCtx;
}) => {
  const inputVal =
    model.draft?.username ?? model.profiles[ctx.currentUserId]?.username ?? "";
  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <Button
            variant="text"
            color="primary"
            onClick={() =>
              ctx.onPush({ t: "profile", c: { t: "profile-update" } })
            }
            text="Cancel"
          />
        }
        title="Username"
        right={
          <Button
            variant="text"
            color="primary"
            onClick={() => {
              const username = model.draft?.username;
              if (username) {
                dispatch({ t: "change-username", username });
              }
            }}
            text="Done"
          />
        }
      />

      <div className="w-full p-4">
        <MyTextField
          label="Username"
          value={inputVal}
          id={"username"}
          onChange={(username) =>
            dispatch({ t: "inputted-username", username })
          }
        />
      </div>
    </div>
  );
};
