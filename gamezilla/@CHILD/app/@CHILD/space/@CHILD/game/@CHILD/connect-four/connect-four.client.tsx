import { Sub, chain } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import { CoverArt } from "./@SHARED/connect-four-ui/connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBotClient from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUserClient from "./@CHILD/vs-user/vs-user.client";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx;
  ClientCmd: ClientCmd<ToServer>;
  ClientEvt: SpaceClientEvt;
}>;

const VsBot = GameClient.tag("vs-bot", VsBotClient);

const VsUser = GameClient.tag("vs-user", VsUserClient);

//
//
//
// Model
//
//
//

export const init: Client["init"] = (input) => {
  const { state } = input;
  switch (state.t) {
    case "none": {
      return { model: { t: null } };
    }
    case "vs-bot": {
      return VsBot.init({ ...input, state });
    }

    case "vs-user": {
      return VsUser.init({ ...input, state });
    }
  }
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = ({ ctx, msg, model, state }) => {
  switch (msg.t) {
    case "user-changed-mode": {
      return initMode({ ctx, model, state });
    }

    case "vs-bot": {
      if (state.t === "vs-bot" && model.t === "vs-bot") {
        return VsBot.update({ ctx, msg, model, state });
      }
      return { model };
    }

    case "vs-user": {
      if (state.t === "vs-user" && model.t === "vs-user") {
        return VsUser.update({ ctx, msg, model, state });
      }

      return { model };
    }
  }
};

export const updateFromServer: Client["updateFromServer"] = ({
  ctx,
  msg,
  model,
  state,
}) => {
  const initial = model ? { model } : init({ ctx, state });

  if (state.t === "none") {
    return initial;
  }

  if (state.t === "vs-bot" && msg.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.updateFromServer({
      ctx,
      msg,
      model,
      state,
    });
  }

  if (state.t === "vs-user" && msg.t === "vs-user") {
    return initial;
  }

  return initial;
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  return input;
};

export const updateFromGame: Client["updateFromGame"] = (input) => {
  const { model, msg, state, ctx } = input;

  return chain(model ? { model } : init(input), (model) => {
    if (msg.t === "user-changed-mode") {
      return initMode({ ctx, model, state });
    }

    if (state.t === "vs-bot" && model.t === "vs-bot" && msg.t === "vs-bot") {
      return VsBot.updateFromGame({ ...input, state, model, msg });
    }

    if (state.t === "vs-user" && model.t === "vs-user" && msg.t === "vs-user") {
      return VsUser.updateFromGame({ ...input, state, model, msg });
    }
    return { model };
  });
};

const initMode = (input: {
  ctx: SpaceClientCtx;
  state: GameState;
  model: ClientModel;
}): ReturnType<typeof update> => {
  const { state } = input;

  return chain(
    //
    init(input),
    (model) => {
      switch (state.t) {
        case "none": {
          return {
            model,
            cmd: [playSound(APP_SOUND.navBackwardMin)],
            gameEvent: { t: "user-changed-mode", mode: "none" },
          };
        }
        case "vs-user":
        case "vs-bot": {
          return {
            model,
            cmd: [playSound(APP_SOUND.navForwardMin)],
            gameEvent: { t: "user-changed-mode", mode: state.t },
          };
        }
      }
    }
  );
};

//
//
//
// View
//
//
//

export const View = ({
  dispatch,
  ctx,
  state,

  model,
}: {
  dispatch: (msg: ClientMsg) => void;
  ctx: SpaceViewCtx;
  state: GameState;
  model: ClientModel;
}) => {
  const onQuit = () => {};
  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return (
      <VsBot.View
        ctx={{ ...ctx, onQuit }}
        dispatch={dispatch}
        model={model}
        state={state}
      />
    );
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return (
      <VsUser.View
        ctx={{ ...ctx, onQuit }}
        dispatch={dispatch}
        model={model}
        state={state}
      />
    );
  }

  return (
    <MainMenuScreen.View
      ctx={ctx}
      title="Connect Four"
      renderCoverArt={(props) => <CoverArt {...props} />}
      buttons={[
        MainMenuScreen.buttons.playFriend({
          onClick: () =>
            dispatch({
              mode: "vs-user",
              t: "user-changed-mode",
              userId: ctx.currentUserId,
            }),
        }),
        MainMenuScreen.buttons.playComputer({
          onClick: () =>
            dispatch({
              mode: "vs-bot",
              t: "user-changed-mode",
              userId: ctx.currentUserId,
            }),
        }),
      ]}
    />
  );
};

export const viewEvent: Client["viewEvent"] = (input) => {
  const { event, ctx } = input;

  if (event.t === "user-changed-mode") {
    const profile = ctx.profiles[ctx.currentUserId];
    if (!profile) {
      return null;
    }
    if (event.mode === "none") {
      return { text: `${profile.username} exited game to main menu` };
    }
    return {
      text: `${profile.username} changed`,
    };
  }

  if (event.t === "vs-bot") {
    return VsBot.viewEvent?.({ ctx, event }) ?? null;
  }

  if (event.t === "vs-user") {
    return VsUser.viewEvent?.({ ctx, event }) ?? null;
  }

  return null;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (input) => {
  const { model, state } = input;

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return VsBot.subscriptions({ ...input, model, state });
  }

  if (state.t === "vs-user" && model.t === "vs-user") {
    return VsUser.subscriptions({ ...input, model, state });
  }

  return Sub.None;
};
