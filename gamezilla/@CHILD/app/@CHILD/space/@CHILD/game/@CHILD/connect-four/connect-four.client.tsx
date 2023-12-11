import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { GameClient } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client";
import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/feed-item";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
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
        ctx: { ...input.ctx, onQuit: () => {} },
      });

      return initial;
    }

    case "vs-user": {
      const initial = VsUser.init({
        ...input,
        state,
        ctx: { ...input.ctx, onQuit: () => {} },
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
      const { msg, evt, gameEvent, serverMsg, state, stateBefore } = input;

      switch (state.t) {
        case "none": {
          return { model };
        }

        case "vs-bot": {
          return VsBot.update({
            ctx: { ...input.ctx, onQuit: () => {} },
            msg: msg?.t === "vs-bot" ? msg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-bot" ? gameEvent : null,
            serverMsg: serverMsg?.t === "vs-bot" ? serverMsg : null,
            model: model.t === "vs-bot" ? model : null,
            state,
            stateBefore: stateBefore.t === "vs-bot" ? stateBefore : state,
          });
        }

        case "vs-user": {
          return VsUser.update({
            ctx: { ...input.ctx, onQuit: () => {} },
            model: model.t === "vs-user" ? model : null,
            msg: msg?.t === "vs-user" ? msg : null,
            evt: evt,
            gameEvent: gameEvent?.t === "vs-user" ? gameEvent : null,
            serverMsg: serverMsg?.t === "vs-user" ? serverMsg : null,
            state,
            stateBefore: stateBefore.t === "vs-user" ? stateBefore : state,
          });
        }
      }
    },
    (model) => {
      const { msg } = input;

      switch (msg?.t) {
        case "user-changed-mode": {
          return {
            model,
            gameEvent: [withId(msg)],
          };
        }

        default: {
          return { model };
        }
      }
    },
    (model) => {
      const { gameEvent } = input;

      if (gameEvent?.t !== "user-changed-mode") {
        return { model };
      }

      if (gameEvent.mode === "none") {
        return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
      }

      return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
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

export const ViewFeedItem: Client["ViewFeedItem"] = (input) => {
  const { event, ctx, state } = input;
  switch (event.t) {
    case "user-changed-mode": {
      switch (event.mode) {
        case "none": {
          const profile = ctx.profiles[ctx.currentUserId];

          if (!profile) {
            return <FeedItem.Info text={`Exited game to main menu`} />;
          }

          return (
            <FeedItem.Info
              text={`${profile.username} exited game to main menu`}
            />
          );
        }

        default: {
          const profile = ctx.profiles[ctx.currentUserId];

          if (!profile) {
            return <FeedItem.Info text={`Changed game mode`} />;
          }

          return (
            <FeedItem.Info text={`${profile.username} changed game mode`} />
          );
        }
      }
    }

    case "vs-bot": {
      switch (state.t) {
        case "vs-bot": {
          return (
            <VsBot.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              event={event}
              state={state}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    case "vs-user": {
      switch (state.t) {
        case "vs-user": {
          return (
            <VsUser.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              event={event}
              state={state}
            />
          );
        }
        default: {
          return null;
        }
      }
    }
  }
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
        ctx: { ...input.ctx, onQuit: () => {} },
      });
    }

    case "vs-user": {
      return VsUser.subscriptions({
        ...input,
        model: model?.t === "vs-user" ? model : undefined,
        state,
        ctx: { ...input.ctx, onQuit: () => {} },
      });
    }
  }
};
