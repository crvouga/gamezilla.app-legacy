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
  ModelClient,
  MsgClient,
  MsgGame,
  ModelGame,
  MsgToClient,
  MsgToServer,
} from "./connect-four.core";

//
//
//
//
//
//
//

type Module = GameClientModule<{
  Model: ModelClient;
  Msg: MsgClient;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  ModelGame: ModelGame;
  MsgGame: MsgGame;
  Ctx: SpaceClientCtx;
  MsgInCmd: null;
  MsgInEvent: SpaceClientEvent;
  MsgOutCmd: ClientCmd<{
    MsgClient: MsgClient;
    MsgToServer: MsgToServer;
  }>;
  MsgOutEvent: null;
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
    (model) => updateFromMsgGame(model)(input)
  );
};

const updateFromMsg =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg } = input;

    if (!msg) {
      return { model };
    }

    switch (msg.t) {
      case "user-changed-mode": {
        return {
          model,
          msgGame: [withId(msg)],
        };
      }

      case "vs-user":
      case "vs-bot": {
        return { model };
      }
    }
  };

const updateFromMsgGame =
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msgGame } = input;

    if (!msgGame) {
      return { model };
    }

    switch (msgGame.t) {
      case "user-changed-mode": {
        switch (msgGame.mode) {
          case "none": {
            return {
              model: { t: null },
              msgCmd: [playSound(APP_SOUND.navBackwardMin)],
            };
          }

          case "vs-bot": {
            return {
              model: { t: "vs-bot", c: VsBot.init },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
            };
          }

          case "vs-user": {
            return {
              model: { t: "vs-user", c: VsUser.init },
              msgCmd: [playSound(APP_SOUND.navForwardMin)],
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
  (model: ModelClient): Module["update"] =>
  (input) => {
    const { msg, msgEvt, msgGame, msgServer, modelGame } = input;

    switch (modelGame.t) {
      case "none": {
        return { model };
      }

      case "vs-bot": {
        const updated = VsBot.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          msg: msg?.t === "vs-bot" ? msg.c : null,
          msgEvt: msgEvt,
          msgCmd: null,
          msgGame:
            msgGame?.t === "vs-bot" ? { ...msgGame, ...msgGame.c } : null,
          msgServer: msgServer?.t === "vs-bot" ? msgServer.c : null,
          model: model.t === "vs-bot" ? model.c : VsBot.init,
          modelGame: modelGame.c,
        });

        return GameClientModule.tagOutput(
          "vs-bot",
          (msgCmd) => ClientCmd.tag("vs-bot", msgCmd),
          updated
        );
      }

      case "vs-user": {
        const updated = VsUser.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          model: model.t === "vs-user" ? model.c : VsUser.init,
          msg: msg?.t === "vs-user" ? msg.c : null,
          msgCmd: null,
          msgEvt: msgEvt,
          msgGame:
            msgGame?.t === "vs-user" ? { ...msgGame, ...msgGame.c } : null,
          msgServer: msgServer?.t === "vs-user" ? msgServer.c : null,
          modelGame: modelGame.c,
        });

        return GameClientModule.tagOutput(
          "vs-user",
          (msgCmd) => ClientCmd.tag("vs-user", msgCmd),
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

const View: Module["View"] = ({ dispatch, ctx, modelGame, model }) => {
  const onQuit = () => {
    dispatch({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    });
  };

  switch (modelGame.t) {
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
          modelGame={modelGame.c}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          dispatch={(c) => dispatch({ t: "vs-user", c })}
          model={model?.t === "vs-user" ? model.c : VsUser.init}
          modelGame={modelGame.c}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { modelGame, ctx, msgGame } = input;
  switch (msgGame.t) {
    case "user-changed-mode": {
      switch (msgGame.mode) {
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
      switch (modelGame.t) {
        case "vs-bot": {
          return (
            <VsBot.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgGame={msgGame.c}
              modelGame={modelGame.c}
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
      switch (modelGame.t) {
        case "vs-user": {
          return (
            <VsUser.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgGame={msgGame.c}
              modelGame={modelGame.c}
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
  const { model, modelGame } = input;

  switch (modelGame.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag(
        "vs-bot",
        VsBot.subscriptions({
          ...input,
          model: model?.t === "vs-bot" ? model.c : VsBot.init,
          modelGame: modelGame.c,
          ctx: { ...input.ctx, onQuit: () => {} },
        })
      );
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        VsUser.subscriptions({
          ...input,
          model: model?.t === "vs-user" ? model.c : VsUser.init,
          modelGame: modelGame.c,
          ctx: { ...input.ctx, onQuit: () => {} },
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
