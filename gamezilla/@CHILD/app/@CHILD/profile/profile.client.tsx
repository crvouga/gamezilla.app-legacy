import { AppClient } from "gamezilla/@CHILD/app/@SHARED/architecture";
import {
  AnonymousClientCtx,
  ClientCtx,
  ProfileCmd,
  RouteProfile,
  ViewCtx,
  back,
  replaceRoute,
  sendToServer,
  showToast,
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
import { Sub, isErr, loading } from "gamezilla/@SHARED/core";
import { ViewProfileScreen } from "./profile-client/profile-client-view-profile-screen";
import { ViewUpdateAvatarScreen } from "./profile-client/profile-client-view-update-avatar-screen";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./profile.core";

//
//
//
//
//
//
//

type Client = AppClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  ClientCtx: ClientCtx | AnonymousClientCtx;
  ViewCtx: ViewCtx & {
    viewBottomBar: VDom;
    route: RouteProfile;
  };
  Cmd: ProfileCmd;
}>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ ctx, stored }) => {
  return AppClient.chain(
    {
      model: stored ? stored : { profiles: {}, requests: {} },
    },
    (model) => {
      if (
        ctx.currentRoute.t === "profile" &&
        ctx.currentRoute.c.t === "profile"
      ) {
        return loadProfile(ctx.currentRoute.c.userId, model);
      }
      return { model };
    }
  );
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = (input) => {
  return AppClient.chain(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromServer({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateFromCommand({ ...input, model })
  );
};

const updateFromCommand: Client["update"] = (input) => {
  const { model, msg } = input;

  if (msg.variant !== "cmd") {
    return { model };
  }

  switch (msg.t) {
    case "profile/add-profiles": {
      return {
        model: {
          ...model,
          profiles: {
            ...model.profiles,
            ...msg.profiles,
          },
        },
      };
    }
  }
};

const updateFromEvent: Client["update"] = (input) => {
  const { msg, model } = input;

  if (msg.variant !== "evt") {
    return { model };
  }

  switch (msg.t) {
    case "routing/route-changed": {
      if (msg.route.t === "profile" && msg.route.c.t === "profile") {
        return loadProfile(msg.route.c.userId, model);
      }
      return { model };
    }

    default: {
      return { model };
    }
  }
};

const updateFromServer: Client["update"] = (input) => {
  const { msg, model } = input;

  if (msg.variant !== "from-server") {
    return { model };
  }

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
        msg: msg.loggedIn
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

const updateFromMsg: Client["update"] = (input) => {
  const { msg, model } = input;

  if (msg.variant !== "msg") {
    return { model };
  }

  switch (msg.t) {
    case "inputted-username": {
      return {
        model: {
          ...model,
          draft: { ...model.draft, username: msg.username },
        },
      };
    }

    case "inputted-avatar-seed": {
      return {
        model: {
          ...model,
          draft: {
            ...model.draft,
            avatarSeed: ProfileAvatar.toSeed(msg.seed),
          },
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

    case "clicked-back-button": {
      switch (msg.from.t) {
        case "profile": {
          return { model, msg: [back()] };
        }
        case "profile-avatar": {
          return {
            model,
            msg: [
              replaceRoute({ t: "profile", c: { t: "profile-update-avatar" } }),
            ],
          };
        }
      }
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
        msg: [sendToServer(msg)],
      };
    }
  }
};

const loadProfile = (
  userId: UserId,
  model: ClientModel
): ReturnType<Client["update"]> => {
  return {
    model: {
      ...model,
      requests: { ...model.requests, "find-one": loading },
    },
    msg: [
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
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (_input) => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Client["View"] = ({ model, dispatch, ctx }) => {
  const { route: routeProfile } = ctx;

  switch (routeProfile.t) {
    case "profile": {
      return (
        <div class="relative flex h-full w-full flex-col">
          <ViewProfileScreen
            model={model}
            ctx={ctx}
            dispatch={dispatch}
            userId={routeProfile.userId}
          />

          {ctx.viewBottomBar}
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

const ViewField = ({
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
