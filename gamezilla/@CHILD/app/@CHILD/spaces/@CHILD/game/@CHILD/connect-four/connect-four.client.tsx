import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { FeedItem } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/feed-item";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import { VsBot } from "./@CHILD/vs-bot/vs-bot.client";
import { VsUser } from "./@CHILD/vs-user/vs-user.client";
import { CoverArt } from "./@SHARED/connect-four-ui/connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./connect-four.core";

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
  InEvent: SpaceClientEvent;
  OutCmd: ClientCmd<{
    ClientMsg: ClientMsg;
    ToServer: ToServer;
  }>;
  OutEvent: null;
}>;

//
//
//
// Model
//
//
//

const init: Module["init"] = { t: null };

//
//
//
// Update
//
//
//

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateChild(model)(input),
    (model) => updateFromMsg(model)(input),
    (model) => updateFromGameEvent(model)(input)
  );
};

const updateFromMsg =
  (model: ClientModel): Module["update"] =>
    (input) => {
      const { msg } = input;

      if (!msg) {
        return { model };
      }

      switch (msg.t) {
        case "user-changed-mode": {
          return {
            model,
            gameEvent: [withId(msg)],
          };
        }

        case "vs-user":
        case "vs-bot": {
          return { model };
        }
      }
    };

const updateFromGameEvent =
  (model: ClientModel): Module["update"] =>
    (input) => {
      const { gameEvent } = input;

      if (!gameEvent) {
        return { model };
      }

      switch (gameEvent.t) {
        case "user-changed-mode": {
          switch (gameEvent.mode) {
            case "none": {
              return {
                model: { t: null },
                cmd: [playSound(APP_SOUND.navBackwardMin)],
              };
            }

            case "vs-bot": {
              return {
                model: { t: "vs-bot", c: VsBot.init },
                cmd: [playSound(APP_SOUND.navForwardMin)],
              };
            }

            case "vs-user": {
              return {
                model: { t: "vs-user", c: VsUser.init },
                cmd: [playSound(APP_SOUND.navForwardMin)],
              };
            }
          }
        }

        case "vs-bot":
        case "vs-user": {
          return { model };
        }
      }
    };

const updateChild =
  (model: ClientModel): Module["update"] =>
    (input) => {
      const { msg, event, gameEvent, fromServer, gameState } = input;

      switch (gameState.t) {
        case "none": {
          return { model };
        }

        case "vs-bot": {
          const updated = VsBot.update({
            ctx: { ...input.ctx, onQuit: () => { } },
            msg: msg?.t === "vs-bot" ? msg.c : null,
            event: event,
            cmd: null,
            gameEvent:
              gameEvent?.t === "vs-bot" ? { ...gameEvent, ...gameEvent.c } : null,
            fromServer: fromServer?.t === "vs-bot" ? fromServer.c : null,
            model: model.t === "vs-bot" ? model.c : VsBot.init,
            gameState: gameState.c,
          });

          return GameClientModule.tagOutput(
            "vs-bot",
            (cmd) => ClientCmd.tag("vs-bot", cmd),
            updated
          );
        }

        case "vs-user": {
          const updated = VsUser.update({
            ctx: { ...input.ctx, onQuit: () => { } },
            model: model.t === "vs-user" ? model.c : VsUser.init,
            msg: msg?.t === "vs-user" ? msg.c : null,
            cmd: null,
            event: event,
            gameEvent:
              gameEvent?.t === "vs-user"
                ? { ...gameEvent, ...gameEvent.c }
                : null,
            fromServer: fromServer?.t === "vs-user" ? fromServer.c : null,
            gameState: gameState.c,
          });

          return GameClientModule.tagOutput(
            "vs-user",
            (cmd) => ClientCmd.tag("vs-user", cmd),
            updated
          );
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

const View: Module["View"] = ({ dispatch, ctx, gameState, model }) => {
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
          dispatch={(c) => dispatch({ t: "vs-bot", c })}
          model={model?.t === "vs-bot" ? model.c : VsBot.init}
          gameState={gameState.c}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          dispatch={(c) => dispatch({ t: "vs-user", c })}
          model={model?.t === "vs-user" ? model.c : VsUser.init}
          gameState={gameState.c}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
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
              ctx={{ ...ctx, onQuit: () => { } }}
              gameEvent={gameEvent.c}
              gameState={gameState.c}
              dispatch={(c) => input.dispatch({ t: "vs-bot", c })}
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
              ctx={{ ...ctx, onQuit: () => { } }}
              gameEvent={gameEvent.c}
              gameState={gameState.c}
              dispatch={(c) => input.dispatch({ t: "vs-user", c })}
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

const subscriptions: Module["subscriptions"] = (input) => {
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
          model: model?.t === "vs-bot" ? model.c : VsBot.init,
          gameState: gameState.c,
          ctx: { ...input.ctx, onQuit: () => { } },
        })
      );
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        VsUser.subscriptions({
          ...input,
          model: model?.t === "vs-user" ? model.c : VsUser.init,
          gameState: gameState.c,
          ctx: { ...input.ctx, onQuit: () => { } },
        })
      );
    }
  }
};

export const ConnectFour: Module = {
  init,
  update,
  View,
  ViewFeedItem,
  subscriptions,
};
