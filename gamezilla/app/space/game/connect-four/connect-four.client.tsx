import { Sub, chain } from "gamezilla/@SHARED/core";
import { APP_SOUND, playSound } from "gamezilla/app/@SHARED/client";
import {
  GameClient,
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  Event,
  State,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBotClient from "./vs-bot/vs-bot.client";
import * as VsUserClient from "./vs-user/vs-user.client";

type Client = GameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State,
  Event
>;

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
  if (state.t === "none") {
    return { model };
  }

  if (state.t === "vs-bot" && model.t === "vs-bot" && msg.t === "vs-bot") {
    return VsBot.update({ ctx, msg, model, state });
  }

  if (state.t === "vs-user" && model.t === "vs-user" && msg.t === "vs-user") {
    return { model };
  }

  return { model };
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

  if (state.t === "vs-bot" && msg.t === "vs-bot") {
    return VsBot.updateFromServer({
      ctx,
      msg,
      model: model?.t === "vs-bot" ? model : null,
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
  state: State;
  model: ClientModel;
}) => {
  const { state, model } = input;

  switch (state.t) {
    case "none": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navBackwardMin)],
      };
    }
    case "vs-user":
    case "vs-bot": {
      return {
        model,
        cmd: [playSound(APP_SOUND.navForwardMin)],
      };
    }
  }
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
  dispatchEvent,
  model,
}: {
  dispatch: (msg: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
  ctx: SpaceViewCtx;
  state: State;
  model: ClientModel;
}) => {
  const onQuit = () =>
    dispatchEvent({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    });

  if (state.t === "vs-bot" && model.t === "vs-bot") {
    return (
      <VsBot.View
        ctx={{ ...ctx, onQuit }}
        dispatch={dispatch}
        dispatchEvent={dispatchEvent}
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
        dispatchEvent={dispatchEvent}
        model={model}
        state={state}
      />
    );
  }

  return (
    <MainMenuScreen
      ctx={ctx}
      title="Connect Four"
      renderCoverArt={(props) => <ViewCoverArt {...props} />}
      buttons={[
        mainMenuButtons.playFriend({
          onClick: () =>
            dispatchEvent({
              mode: "vs-user",
              t: "user-changed-mode",
              userId: ctx.currentUserId,
            }),
        }),
        mainMenuButtons.playComputer({
          onClick: () =>
            dispatchEvent({
              mode: "vs-bot",
              t: "user-changed-mode",
              userId: ctx.currentUserId,
            }),
        }),
      ]}
    />
  );
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
