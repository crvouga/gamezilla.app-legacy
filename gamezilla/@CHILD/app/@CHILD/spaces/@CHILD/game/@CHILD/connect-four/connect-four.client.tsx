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
          msgGameEvent: [withId(msg)],
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
    const { msgGameEvent } = input;

    if (!msgGameEvent) {
      return { model };
    }

    switch (msgGameEvent.t) {
      case "user-changed-mode": {
        switch (msgGameEvent.mode) {
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
  (model: ClientModel): Module["update"] =>
  (input) => {
    const { msg, msgEvent, msgGameEvent, msgFromServer, modelGameState } =
      input;

    switch (modelGameState.t) {
      case "none": {
        return { model };
      }

      case "vs-bot": {
        const updated = VsBot.update({
          ctx: { ...input.ctx, onQuit: () => {} },
          msg: msg?.t === "vs-bot" ? msg.c : null,
          msgEvent: msgEvent,
          msgCmd: null,
          msgGameEvent:
            msgGameEvent?.t === "vs-bot"
              ? { ...msgGameEvent, ...msgGameEvent.c }
              : null,
          msgFromServer: msgFromServer?.t === "vs-bot" ? msgFromServer.c : null,
          model: model.t === "vs-bot" ? model.c : VsBot.init,
          modelGameState: modelGameState.c,
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
          msgEvent: msgEvent,
          msgGameEvent:
            msgGameEvent?.t === "vs-user"
              ? { ...msgGameEvent, ...msgGameEvent.c }
              : null,
          msgFromServer:
            msgFromServer?.t === "vs-user" ? msgFromServer.c : null,
          modelGameState: modelGameState.c,
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

const View: Module["View"] = ({ emit, ctx, modelGameState, model }) => {
  const onQuit = () => {
    emit({
      t: "user-changed-mode",
      mode: "none",
      userId: ctx.currentUserId,
    });
  };

  switch (modelGameState.t) {
    case "none": {
      return (
        <MainMenuScreen.View
          ctx={ctx}
          title="Connect Four"
          renderCoverArt={(props) => <CoverArt {...props} />}
          buttons={[
            MainMenuScreen.buttons.playFriend({
              onClick: () =>
                emit({
                  mode: "vs-user",
                  t: "user-changed-mode",
                  userId: ctx.currentUserId,
                }),
            }),
            MainMenuScreen.buttons.playComputer({
              onClick: () =>
                emit({
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
          emit={(c) => emit({ t: "vs-bot", c })}
          model={model?.t === "vs-bot" ? model.c : VsBot.init}
          modelGameState={modelGameState.c}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={{ ...ctx, onQuit }}
          emit={(c) => emit({ t: "vs-user", c })}
          model={model?.t === "vs-user" ? model.c : VsUser.init}
          modelGameState={modelGameState.c}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = (input) => {
  const { modelGameState, ctx, msgGameEvent } = input;
  switch (msgGameEvent.t) {
    case "user-changed-mode": {
      switch (msgGameEvent.mode) {
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
      switch (modelGameState.t) {
        case "vs-bot": {
          return (
            <VsBot.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgGameEvent={msgGameEvent.c}
              modelGameState={modelGameState.c}
              emit={(c) => input.emit({ t: "vs-bot", c })}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    case "vs-user": {
      switch (modelGameState.t) {
        case "vs-user": {
          return (
            <VsUser.ViewFeedItem
              ctx={{ ...ctx, onQuit: () => {} }}
              msgGameEvent={msgGameEvent.c}
              modelGameState={modelGameState.c}
              emit={(c) => input.emit({ t: "vs-user", c })}
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
  const { model, modelGameState } = input;

  switch (modelGameState.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag(
        "vs-bot",
        VsBot.subscriptions({
          ...input,
          model: model?.t === "vs-bot" ? model.c : VsBot.init,
          modelGameState: modelGameState.c,
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
          modelGameState: modelGameState.c,
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
