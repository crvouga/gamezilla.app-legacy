import { ClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  ProfileCmd,
  back,
  playSound,
  pushRoute,
  replaceRoute,
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

type Ctx = (ClientCtx | AnonymousClientCtx) & {
  viewBottomBar: VDom;
};

type Module = ClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  Ctx: Ctx;
  InCmd: ProfileCmd;
  InEvt: ClientEvt;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvt: never;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = ({ ctx, stored }) => {
  const initialModel: ClientModel = {
    profiles: {},
    requests: {},
    draft: {},
  };

  const model = stored ? stored : initialModel;

  if (ctx.currentRoute.t === "profile" && ctx.currentRoute.c.t === "profile") {
    return loadProfile(ctx.currentRoute.c.userId, model);
  }

  return { model };
};

//
//
//
// Update
//
//
//

export const update: Module["update"] = (input) => {
  if (input.evt) {
    return updateFromEvent(input);
  }

  if (input.msg) {
    return updateFromMsg(input);
  }

  if (input.fromServer) {
    return updateFromServer(input);
  }

  if (input.cmd) {
    return updateFromCmd(input);
  }

  return { model: input.model };
};

const updateFromCmd: Module["update"] = (input) => {
  const { model, cmd } = input;

  if (!cmd) {
    return { model };
  }

  switch (cmd.c.t) {
    case "add-profiles": {
      return {
        model: {
          ...model,
          profiles: {
            ...model.profiles,
            ...cmd.c.profiles,
          },
        },
      };
    }
  }
};

const updateFromEvent: Module["update"] = (input) => {
  const { evt, model } = input;

  if (!evt) {
    return { model };
  }

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

const updateFromServer: Module["update"] = (input) => {
  const { model, fromServer } = input;

  if (!fromServer) {
    return { model };
  }

  switch (fromServer.t) {
    case "current-user-profile": {
      if (isErr(fromServer.result)) {
        return { model };
      }

      const profile = fromServer.result.value;

      const modelNew: ClientModel = {
        ...model,
        profiles: {
          ...model.profiles,
          [profile.userId]: profile,
        },
      };

      return {
        model: modelNew,
        cmd: fromServer.loggedIn
          ? [showToast(`Logged in as ${profile.username}`)]
          : [],
      };
    }
    default: {
      if (isErr(fromServer.result)) {
        return {
          model: {
            ...model,
            requests: {
              ...model.requests,
              [fromServer.t]: fromServer.result,
            },
          },
        };
      }

      const profilesNew = fromServer.result.value.reduce<
        ClientModel["profiles"]
      >((acc, profile) => {
        return {
          ...acc,
          [profile.userId]: profile,
        };
      }, model.profiles);

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

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model, ctx } = input;

  if (!msg) {
    return { model };
  }

  if (!ctx.currentUserId) {
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
          return { model, cmd: [back()] };
        }

        case "profile-update": {
          return {
            model,
            cmd: [
              replaceRoute({
                t: "profile",
                c: { t: "profile", userId: ctx.currentUserId },
              }),
            ],
          };
        }

        case "profile-avatar": {
          return {
            model,
            cmd: [
              replaceRoute({ t: "profile", c: { t: "profile-update-avatar" } }),
            ],
          };
        }

        case "profile-update-username": {
          return {
            model,
            cmd: [replaceRoute({ t: "profile", c: { t: "profile-update" } })],
          };
        }
      }
    }

    case "clicked-logout-button": {
      return {
        model,
        cmd: [pushRoute({ t: "logout" }), playSound(APP_SOUND.tap)],
      };
    }

    case "clicked-update-username-button": {
      return {
        model,
        cmd: [pushRoute({ t: "profile", c: { t: "profile-update-username" } })],
      };
    }

    case "clicked-edit-profile-button": {
      return {
        model,
        cmd: [pushRoute({ t: "profile", c: { t: "profile-update" } })],
      };
    }

    case "clicked-avatar":
    case "clicked-change-avatar-button": {
      return {
        model,
        cmd: [pushRoute({ t: "profile", c: { t: "profile-update-avatar" } })],
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
        toServer: [msg],
      };
    }
  }
};

const loadProfile = (
  userId: UserId,
  model: ClientModel
): ReturnType<Module["update"]> => {
  return {
    model: {
      ...model,
      requests: { ...model.requests, "find-one": loading },
    },
    toServer: [{ t: "find-one", userId }],
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Module["subscriptions"] = (_input) => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View: Module["View"] = ({ model, dispatch, ctx }) => {
  const { currentRoute } = ctx;

  if (currentRoute.t !== "profile") {
    return null;
  }

  const route = currentRoute.c;

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

          {ctx.viewBottomBar}
        </div>
      );
    }

    case "profile-update": {
      return <ViewUpdateScreen ctx={ctx} dispatch={dispatch} />;
    }

    case "profile-update-username": {
      return (
        <ViewUpdateUsernameScreen dispatch={dispatch} ctx={ctx} model={model} />
      );
    }

    case "profile-update-avatar": {
      return <ViewUpdateAvatarScreen dispatch={dispatch} model={model} />;
    }

    default: {
      return <LoadingScreen />;
    }
  }
};

const ViewUpdateScreen = ({
  ctx,
  dispatch,
}: {
  ctx: Ctx;
  dispatch: (m: ClientMsg) => void;
}) => {
  if (!ctx.currentUserId) {
    return null;
  }

  const profile = ctx.profiles[ctx.currentUserId];

  return (
    <div class="flex h-full w-full flex-col items-center gap-4">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({
                t: "clicked-back-button",
                from: { t: "profile-update" },
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
          onClick={() => dispatch({ t: "clicked-avatar" })}
        />

        <Button
          size="sm"
          color="primary"
          variant="text"
          class="block"
          onClick={() => dispatch({ t: "clicked-change-avatar-button" })}
          text=" Change Avatar"
        />
      </div>

      <ViewField
        onClick={() => dispatch({ t: "clicked-update-username-button" })}
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
    class="flex w-full items-center justify-start px-4 py-2"
  >
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
  ctx: Ctx;
}) => {
  const currentUsername = ctx.currentUserId
    ? model.profiles[ctx.currentUserId]?.username
    : null;

  const inputVal = model.draft?.username ?? currentUsername ?? "";
  return (
    <div class="flex h-full w-full flex-col">
      <TopBar
        left={
          <Button
            variant="text"
            color="primary"
            onClick={() =>
              dispatch({
                t: "clicked-back-button",
                from: { t: "profile-update-username" },
              })
            }
            text="Back"
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
