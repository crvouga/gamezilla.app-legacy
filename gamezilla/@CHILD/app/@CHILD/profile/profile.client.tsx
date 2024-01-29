import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvent,
  ProfileCmd,
  back,
  playSound,
  pushRoute,
  replaceRoute,
  sendMsgToServer,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { ProfileAvatar, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Button,
  IconChevronRight,
  LoadingState,
  Avatar,
  TextField,
  TopBar,
  TopBarBackButton,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, isErr, loading } from "gamezilla/@SHARED/core";
import { ViewProfileScreen } from "./profile-client/profile-client-view-profile-screen";
import { ViewUpdateAvatarScreen } from "./profile-client/profile-client-view-update-avatar-screen";
import {
  ClientModel,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./profile.core";

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

type Module = AppClientModule<{
  Model: ClientModel;
  Msg: MsgClient;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  Ctx: Ctx;
  MsgInCmd: ProfileCmd;
  MsgInEvent: ClientEvent;
  MsgOutCmd: ClientCmd<{
    MsgClient: MsgClient;
    MsgToServer: MsgToServer;
  }>;
  MsgOutEvent: never;
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
  if (input.msgEvt) {
    return updateFromEvent(input);
  }

  if (input.msg) {
    return updateFromMsg(input);
  }

  if (input.msgServer) {
    return updateFromServer(input);
  }

  if (input.msgCmd) {
    return updateFromCmd(input);
  }

  return { model: input.model };
};

const updateFromCmd: Module["update"] = (input) => {
  const { model, msgCmd } = input;

  if (!msgCmd) {
    return { model };
  }

  switch (msgCmd.c.t) {
    case "add-profiles": {
      return {
        model: {
          ...model,
          profiles: {
            ...model.profiles,
            ...msgCmd.c.profiles,
          },
        },
      };
    }
  }
};

const updateFromEvent: Module["update"] = (input) => {
  const { msgEvt, model } = input;

  if (!msgEvt) {
    return { model };
  }

  switch (msgEvt.t) {
    case "routing/route-changed": {
      if (msgEvt.route.t === "profile" && msgEvt.route.c.t === "profile") {
        return loadProfile(msgEvt.route.c.userId, model);
      }
      return { model };
    }

    default: {
      return { model };
    }
  }
};

const updateFromServer: Module["update"] = (input) => {
  const { model, msgServer } = input;

  if (!msgServer) {
    return { model };
  }

  switch (msgServer.t) {
    case "current-user-profile": {
      if (isErr(msgServer.result)) {
        return { model };
      }

      const profile = msgServer.result.value;

      const modelNew: ClientModel = {
        ...model,
        profiles: {
          ...model.profiles,
          [profile.userId]: profile,
        },
      };

      return {
        model: modelNew,
        msgCmd: msgServer.loggedIn
          ? [showToast(`Logged in as ${profile.username}`)]
          : [],
      };
    }
    default: {
      if (isErr(msgServer.result)) {
        return {
          model: {
            ...model,
            requests: {
              ...model.requests,
              [msgServer.t]: msgServer.result,
            },
          },
        };
      }

      const profilesNew = msgServer.result.value.reduce<
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
          return { model, msgCmd: [back()] };
        }

        case "profile-update": {
          return {
            model,
            msgCmd: [
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
            msgCmd: [
              replaceRoute({ t: "profile", c: { t: "profile-update-avatar" } }),
            ],
          };
        }

        case "profile-update-username": {
          return {
            model,
            msgCmd: [
              replaceRoute({ t: "profile", c: { t: "profile-update" } }),
            ],
          };
        }
      }
    }

    case "clicked-logout-button": {
      return {
        model,
        msgCmd: [pushRoute({ t: "logout" }), playSound(APP_SOUND.tap)],
      };
    }

    case "clicked-update-username-button": {
      return {
        model,
        msgCmd: [
          pushRoute({ t: "profile", c: { t: "profile-update-username" } }),
        ],
      };
    }

    case "clicked-edit-profile-button": {
      return {
        model,
        msgCmd: [pushRoute({ t: "profile", c: { t: "profile-update" } })],
      };
    }

    case "clicked-avatar":
    case "clicked-change-avatar-button": {
      return {
        model,
        msgCmd: [
          pushRoute({ t: "profile", c: { t: "profile-update-avatar" } }),
        ],
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
    msgCmd: [sendMsgToServer({ t: "find-one", userId })],
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
        <div className="relative flex h-full w-full flex-col">
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
      return <LoadingState />;
    }
  }
};

const ViewUpdateScreen = ({
  ctx,
  dispatch,
}: {
  ctx: Ctx;
  dispatch: (m: MsgClient) => void;
}) => {
  if (!ctx.currentUserId) {
    return null;
  }

  const profile = ctx.profiles[ctx.currentUserId];

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
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

      <div className="flex w-full flex-col items-center gap-2 py-2">
        <Avatar
          src={profile?.avatarUrl}
          className="h-28 w-28"
          alt="profile avatar"
          onClick={() => dispatch({ t: "clicked-avatar" })}
        />

        <Button
          size="sm"
          color="primary"
          variant="text"
          className="block"
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
    className="flex w-full items-center justify-start px-4 py-2"
  >
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
  dispatch: (msg: MsgClient) => void;
  ctx: Ctx;
}) => {
  const currentUsername = ctx.currentUserId
    ? model.profiles[ctx.currentUserId]?.username
    : null;

  const inputVal = model.draft?.username ?? currentUsername ?? "";
  return (
    <div className="flex h-full w-full flex-col">
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

      <div className="w-full p-4">
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
