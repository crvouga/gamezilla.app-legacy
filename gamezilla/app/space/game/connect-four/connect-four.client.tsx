import { Sub } from "gamezilla/@SHARED/core";
import { SpaceGameClient, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  Evt,
  State,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBotClient from "./vs-bot/vs-bot.client";
import * as VsUserClient from "./vs-user/vs-user.client";

type Client = SpaceGameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State,
  Evt
>;

const VsBot = SpaceGameClient.tag("vs-bot", VsBotClient);

const VsUser = SpaceGameClient.tag("vs-user", VsUserClient);

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
  if (state.t === "none") {
    return { model };
  }

  if (state.t === "vs-bot" && model.t === "vs-bot" && msg.t === "vs-bot") {
    return VsBot.updateFromServer({
      ctx,
      msg,
      model,
      state,
    });
  }

  if (state.t === "vs-user" && model.t === "vs-user" && msg.t === "vs-user") {
    return { model };
  }

  return { model };
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
};

export const updateFromGameEvt: Client["updateFromGameEvt"] = (input) => {
  const { model, msg, state } = input;

  if (!model) {
    return init(input);
  }

  if (state.t === "vs-bot" && model.t === "vs-bot" && msg.t === "vs-bot") {
    return VsBot.updateFromGameEvt({ ...input, state, model, msg });
  }

  if (state.t === "vs-user" && model.t === "vs-user" && msg.t === "vs-user") {
    return VsUser.updateFromGameEvt({ ...input, state, model, msg });
  }

  return init(input);
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
  dispatchEvent: (m: Evt) => void;
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
