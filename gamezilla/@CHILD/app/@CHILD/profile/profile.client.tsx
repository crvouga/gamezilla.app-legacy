import { Eff, loading, andThen, p, isErr } from "gamezilla/@SHARED/core";
import {
  AnonymousClientCtx,
  ClientCmd,
  ClientEvt,
  AppRoute,
  RouteProfile,
  ViewCtx,
  showToast,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { ProfileAvatar, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Button,
  IconChevronRight,
  LoadingScreen,
  MyAvatar,
  TextField,
  TopBar,
  TopBarBackButton,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
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
  stored,
}: {
  stored: ClientModel | null;
  currentRoute: AppRoute;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return p(
    {
      model: stored ? stored : { profiles: {}, requests: {} },
    },
    andThen((model): ReturnType<typeof init> => {
      if (currentRoute.t === "profile" && currentRoute.c.t === "profile") {
        return loadProfile(currentRoute.c.userId, model);
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
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
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
        cmd: [{ t: "wire/send-to-server", msg }],
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
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "current-user-profile": {
      if (isErr(msg.result)) {
        return { model };
      }

      const profile = msg.result.value;

      const modelNew: ClientModel = {
        ...model,
        profiles: {
          ...model.profiles,
          [profile.userId]: profile,
        },
      };

      return {
        model: modelNew,
        cmd: msg.loggedIn
          ? [showToast(`Logged in as ${profile.username}`)]
          : undefined,
      };
    }
    default: {
      if (isErr(msg.result)) {
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
    }
  }
};

export const updateFromEvent = ({
  evt,
  model,
}: {
  evt: ClientEvt;
  model: ClientModel;
  ctx: AnonymousClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (evt.t) {
    case "routing/route-changed": {
      if (evt.route.t === "profile" && evt.route.c.t === "profile") {
        return loadProfile(evt.route.c.userId, model);
      }
      return { model };
    }

    default: {
      return { model };
    }
  }
};

const loadProfile = (
  userId: UserId,
  model: ClientModel
): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return {
    model: {
      ...model,
      requests: { ...model.requests, "find-one": loading },
    },
    cmd: [
      sendToServer({
        t: "find-one",
        userId,
      }),
    ],
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
  switch (route.t) {
    case "profile": {
      return (
        <div class="relative flex h-full w-full flex-col">
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

    case "profile-update": {
      return <ViewUpdateScreen dispatch={dispatch} ctx={ctx} model={model} />;
    }

    case "profile-update-username": {
      return (
        <ViewUpdateUsernameScreen dispatch={dispatch} ctx={ctx} model={model} />
      );
    }

    case "profile-update-avatar": {
      return (
        <ViewUpdateAvatarScreen dispatch={dispatch} ctx={ctx} model={model} />
      );
    }

    default: {
      return <LoadingScreen />;
    }
  }
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
    <div class="flex h-full w-full flex-col items-center gap-4">
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

      <div class="flex w-full flex-col items-center gap-2 py-2">
        <MyAvatar
          src={profile?.avatarUrl}
          class="h-28 w-28"
          alt="profile avatar"
          onClick={() =>
            ctx.push({ t: "profile", c: { t: "profile-update-avatar" } })
          }
        />

        <Button
          size="sm"
          color="primary"
          variant="text"
          class="block"
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
    class="flex w-full items-center justify-start px-4 py-2">
    <div class="flex flex-1 flex-col items-start">
      <p class="text-sm text-neutral-300">{label}</p>
      {typeof value === "string" ? (
        <p class="h-7 text-lg">{value}</p>
      ) : (
        <div class="flex h-7 w-full items-center ">
          <div class="h-4 w-1/2 animate-pulse rounded-lg bg-neutral-600"></div>
        </div>
      )}
    </div>

    <IconChevronRight class="h-6 w-6" />
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
    <div class="flex h-full w-full flex-col">
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

      <div class="w-full p-4">
        <TextField
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
