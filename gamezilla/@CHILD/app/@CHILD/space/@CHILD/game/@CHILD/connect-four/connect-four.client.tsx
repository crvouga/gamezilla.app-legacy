import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { GameClient } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client";
import { withId } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/feed-item";
import {
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUser from "./@CHILD/vs-user/vs-user.client";
import { CoverArt } from "./@SHARED/connect-four-ui/connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./connect-four.core";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client-v2";

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameState: GameState;
  GameEvent: GameEvent;
  Ctx: SpaceClientCtx;
  InCmd: null;
  InEvt: SpaceClientEvt;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvt: null;
}>;

//
//
//
// Model
//
//
//

export const init: Module["init"] = (input) => {
  const { gameState, model } = input;

  switch (gameState.t) {
    case "none": {
      return { model: { t: null } };
    }

    case "vs-bot": {
      const initial = VsBot.init({
        ...input,
        gameState,
        model: model?.t === "vs-bot" ? model : null,
        ctx: { ...input.ctx, onQuit: () => {} },
      });

      return initial;
    }

    case "vs-user": {
      const initial = VsUser.init({
        ...input,
        gameState,
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

export const update: Module["update"] = (input) => {
  return GameClient.chain(
    init(input),
    (model): ReturnType<Module["update"]> => {
      const { msg, evt, gameEvent, serverMsg, gameState, gameStateBefore } =
        input;

      switch (gameState.t) {
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
            gameState,
            gameStateBefore:
              gameStateBefore.t === "vs-bot" ? gameStateBefore : gameState,
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
            gameState,
            gameStateBefore:
              gameStateBefore.t === "vs-user" ? gameStateBefore : gameState,
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

export const View: Module["View"] = ({ dispatch, ctx, gameState, model }) => {
  const onQuit = () => {
    dispatch({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    });
  };

  switch (gameState.t) {
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
          gameState={gameState}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          dispatch={dispatch}
          model={model?.t === "vs-user" ? model : null}
          gameState={gameState.c}
        />
      );
    }
  }
};

export const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { gameState, ctx, gameEvent } = input;
  switch (gameEvent.t) {
    case "user-changed-mode": {
      switch (gameEvent.mode) {
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
      switch (gameState.t) {
        case "vs-bot": {
          return (
            <VsBot.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              gameEvent={gameEvent.c}
              gameState={gameState.c}
              dispatch={() => {
                //
              }}
              model={input.model?.t === "vs-bot" ? input.model.c : null}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    case "vs-user": {
      switch (gameState.t) {
        case "vs-user": {
          return (
            <VsUser.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              gameEvent={gameEvent.c}
              gameState={gameState.c}
              dispatch={() => {
                //
              }}
              model={input.model?.t === "vs-user" ? input.model.c : null}
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

export const subscriptions: Module["subscriptions"] = (input) => {
  const { model, gameState } = input;

  switch (gameState.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag(
        "vs-bot",
        VsBot.subscriptions({
          ...input,
          model: model?.t === "vs-bot" ? model.c : undefined,
          gameState: gameState.c,
          ctx: { ...input.ctx, onQuit: () => {} },
        })
      );
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        VsUser.subscriptions({
          ...input,
          model: model?.t === "vs-user" ? model.c : null,
          gameState: gameState.c,
          ctx: { ...input.ctx, onQuit: () => {} },
        })
      );
    }
  }
};
