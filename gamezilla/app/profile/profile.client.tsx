import { Eff, Loading, andThen, p } from "gamezilla/@SHARED/core";
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientEvt,
  Route,
  RouteProfile,
  ViewCtx,
} from "gamezilla/app/@SHARED/client";
import { ProfileAvatar, UserId } from "gamezilla/app/@SHARED/data";
import {
  Button,
  IconChevronRight,
  LoadingScreen,
  MyAvatar,
  MyTextField,
  TopBar,
  TopBarBackButton,
  VDom,
} from "gamezilla/app/@SHARED/ui";
import { ViewProfileScreen } from "./profile-client/profile-client-view-profile-screen";
import { ViewUpdateAvatarScreen } from "./profile-client/profile-client-view-update-avatar-screen";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./profile.core";

//
//
//
// model
//
//
//

export const init = ({
  currentRoute,
}: {
  currentRoute: Route;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  return p(
    {
      model: { profiles: {}, requests: {} },
    },
    andThen((model) => {
      if (currentRoute.t === "profile" && currentRoute.c.t === "profile") {
        return loadProfiles([currentRoute.c.userId], model);
      }
      return { model };
    })
  );
};

//
//
//
// update
//
//
//

export const update = ({
  msg,
  model,
}: {
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (msg.t) {
    case "inputted-username": {
      return {
        model: { ...model, draft: { ...model.draft, username: msg.username } },
      };
    }

    case "inputted-avatar-seed": {
      return {
        model: {
          ...model,
          draft: { ...model.draft, avatarSeed: ProfileAvatar.toSeed(msg.seed) },
        },
      };
    }

    case "inputted-avatar-style": {
      return {
        model: {
          ...model,
          draft: { ...model.draft, avatarStyle: msg.style },
        },
      };
    }

    case "clicked-generate-random-seed": {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
          },
        },
      };
    }

    default: {
      return {
        model: {
          ...model,
          requests: {
            ...model.requests,
            [msg.t]: { t: "loading" },
          },
        },
        cmd: [{ t: "send-to-server", msg }],
      };
    }
  }
};

export const updateFromServer = ({
  msg,
  model,
}: {
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
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

  const profilesNew = msg.result.value.reduce<ClientModel["profiles"]>(
    (acc, profile) => {
      return {
        ...acc,
        [profile.userId]: profile,
      };
    },
    model.profiles
  );

  const modelNew: ClientModel = {
    ...model,
    profiles: profilesNew,
  };

  return {
    model: modelNew,
  };
};

export const updateFromEvt = ({
  evt,
  model,
  ctx,
}: {
  evt: ClientEvt;
  model: ClientModel;
  ctx: AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<ToServer>[];
} => {
  return p(
    { model },
    andThen((model) => loadProfileRoute({ evt, model })),
    andThen((model) => updateUsernameDraft({ model, evt, ctx })),
    andThen((model) => gotProfiles({ evt, model })),
    andThen((model) => loadCurrentUserProfile({ evt, model }))
  );
};

const loadCurrentUserProfile = ({
  evt,
  model,
}: {
  evt: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  switch (evt.t) {
    case "client-authenticated": {
      return loadProfiles([evt.userId], model);
    }
    default: {
      return { model };
    }
  }
};

const loadProfileRoute = ({
  evt,
  model,
}: {
  evt: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
  eff?: Eff<ClientMsg>;
} => {
  if (evt.t === "route-changed" && evt.route.t === "profile") {
    if (evt.route.c.t === "profile") {
      return loadProfiles([evt.route.c.userId], model);
    }
  }

  return { model };
};

const loadProfiles = (
  userIds: UserId[],
  model: ClientModel
): {
  model: ClientModel;
  cmd?: ClientCmd<ToServer>[];
} => {
  return {
    model: {
      ...model,
      requests: { ...model.requests, "find-many": Loading },
    },
    cmd: [
      {
        t: "send-to-server",
        msg: {
          t: "find-many",
          userIds,
        },
      },
    ],
  };
};

const gotProfiles = ({
  evt,
  model,
}: {
  evt: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  switch (evt.t) {
    case "got-profiles": {
      return {
        model: {
          ...model,
          profiles: {
            ...model.profiles,
            ...evt.profiles,
          },
        },
      };
    }
    default: {
      return { model };
    }
  }
};

const updateUsernameDraft = ({
  model,
  evt,
  ctx,
}: {
  model: ClientModel;
  evt: ClientEvt;
  ctx: AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  if (evt.t !== "route-changed") {
    return { model };
  }
  const route = evt.route;

  if (route.t !== "profile") {
    return { model };
  }

  if (route.c.t !== "profile-update-username") {
    return { model };
  }

  if (!ctx.currentUserId) {
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
  model: ClientModel;
  route: RouteProfile;
  dispatch: (msg: ClientMsg) => void;
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
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const profile = ctx.profiles[ctx.currentUserId];
  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              ctx.push({
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
            ctx.push({ t: "profile", c: { t: "profile-update-avatar" } })
          }
        />

        <Button
          size="sm"
          color="primary"
          variant="text"
          className="block"
          onClick={() =>
            ctx.push({ t: "profile", c: { t: "profile-update-avatar" } })
          }
          text=" Change Avatar"
        />
      </div>

      <ViewField
        onClick={() =>
          ctx.push({ t: "profile", c: { t: "profile-update-username" } })
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
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
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
              ctx.push({ t: "profile", c: { t: "profile-update" } })
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
