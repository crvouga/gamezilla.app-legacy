import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import {
  GameClient,
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import * as VsBotClient from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUserClient from "./@CHILD/vs-user/vs-user.client";
import { CoverArt } from "./@SHARED/connect-four-ui/connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./connect-four.core";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  ClientCtx: SpaceClientCtx;
  ViewCtx: SpaceViewCtx;
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
  const { state, model } = input;

  switch (state.t) {
    case "none": {
      return { model: { t: null } };
    }

    case "vs-bot": {
      const initial = VsBot.init({
        ...input,
        state,
        model: model?.t === "vs-bot" ? model : null,
      });

      return initial;
    }

    case "vs-user": {
      const initial = VsUser.init({
        ...input,
        state,
        model: model?.t === "vs-user" ? model : null,
      });

      return initial;
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

export const update: Client["update"] = (input) => {
  return GameClient.chain(
    init(input),
    (model): ReturnType<Client["update"]> => {
      const { ctx, msg, evt, gameEvent, serverMsg, state } = input;

      switch (state.t) {
        case "none": {
          return { model };
        }

        case "vs-bot": {
          return VsBot.update({
            ctx,
            msg: msg?.t === "vs-bot" ? msg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-bot" ? gameEvent : null,
            serverMsg: serverMsg?.t === "vs-bot" ? serverMsg : null,
            model: model.t === "vs-bot" ? model : null,
            state,
          });
        }

        case "vs-user": {
          return VsUser.update({
            ctx,
            model: model.t === "vs-user" ? model : null,
            msg: msg?.t === "vs-user" ? msg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-user" ? gameEvent : null,
            serverMsg: serverMsg?.t === "vs-user" ? serverMsg : null,
            state,
          });
        }
      }
    },
    (model) => {
      const { state, gameEvent } = input;

      if (!gameEvent) {
        return { model };
      }

      if (gameEvent.t !== "user-changed-mode") {
        return { model };
      }

      if (state.t === "none") {
        return {
          model,
          cmd: [playSound(APP_SOUND.navBackwardMin)],
        };
      }

      return {
        model,
        cmd: [playSound(APP_SOUND.navForwardMin)],
      };
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

export const View: Client["View"] = ({ dispatch, ctx, state, model }) => {
  const onQuit = () => {
    dispatch({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    });
  };

  switch (state.t) {
    case "none": {
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
    }

    case "vs-bot": {
      return (
        <VsBot.View
          ctx={{ ...ctx, onQuit }}
          dispatch={dispatch}
          model={model?.t === "vs-bot" ? model : null}
          state={state}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          dispatch={dispatch}
          model={model?.t === "vs-user" ? model : null}
          state={state}
        />
      );
    }
  }
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

  switch (state.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return VsBot.subscriptions({
        ...input,
        model: model?.t === "vs-bot" ? model : undefined,
        state,
      });
    }

    case "vs-user": {
      return VsUser.subscriptions({
        ...input,
        model: model?.t === "vs-user" ? model : undefined,
        state,
      });
    }
  }
};
