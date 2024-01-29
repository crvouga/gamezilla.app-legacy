import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { PlayClient } from "./@CHILD/play/play.client";
import { BuilderClient } from "./@CHILD/builder/builder.client";
import { CoverArt } from "./@SHARED/flow-cover-art";
import { FlowClientCtx } from "./@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  MsgGame,
  ModelGame,
  MsgToClient,
  MsgToServer,
} from "./flow.core";

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
  //
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  //
  MsgGame: MsgGame;
  ModelGame: ModelGame;
  //
  Ctx: SpaceClientCtx;
  //
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; ClientMsg: ClientMsg }>;
  MsgInEvent: SpaceClientEvent;
  MsgInCmd: null;
  MsgOutEvent: null;
}>;

//
//
//
//
//
//

const init: Module["init"] = {
  t: "none",
  puzzles: {},
};

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromMsgGame({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = (input) => {
  const { model, modelGame, msgGame, ctx, msgCmd, msgEvt, msgServer, msg } =
    input;

  switch (modelGame.t) {
    case null: {
      return { model };
    }

    case "play": {
      const updated = PlayClient.update({
        ctx: { ...ctx, onQuit: () => {}, puzzles: model.puzzles },
        modelGame: modelGame.c,
        model: model.t === "play" ? model.c : PlayClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "play" ? msgServer.c : null,
        msgGame: msgGame?.t === "play" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "play" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "play",
        (msgCmd) => ClientCmd.tag("play", msgCmd),
        updated
      );

      return { ...tagged, model: { ...tagged.model, puzzles: model.puzzles } };
    }

    case "builder": {
      const updated = BuilderClient.update({
        ctx: { ...ctx, onQuit: () => {}, puzzles: model.puzzles },
        modelGame: modelGame.c,
        model: model.t === "builder" ? model.c : BuilderClient.init,
        msgCmd: msgCmd,
        msgEvt: msgEvt,
        msgServer: msgServer?.t === "builder" ? msgServer.c : null,
        msgGame: msgGame?.t === "builder" ? { ...msgGame, ...msgGame.c } : null,
        msg: msg?.t === "builder" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "builder",
        (msgCmd) => ClientCmd.tag("builder", msgCmd),
        updated
      );

      return { ...tagged, model: { ...tagged.model, puzzles: model.puzzles } };
    }
  }
};

const updateFromMsgGame: Module["update"] = (input) => {
  const { msgGame, model } = input;

  if (!msgGame) {
    return { model };
  }

  switch (msgGame.t) {
    case "builder":
    case "play": {
      return { model };
    }

    case "user-changed-mode": {
      switch (msgGame.mode) {
        case "play": {
          return {
            model: { ...model, t: "play", c: PlayClient.init },
            msgCmd: [playSound(APP_SOUND.navForwardMin)],
          };
        }

        case "builder": {
          return {
            model: {
              ...model,
              t: "builder",
              c: BuilderClient.init,
            },
            msgCmd: [playSound(APP_SOUND.navForwardMin)],
          };
        }

        case null: {
          return {
            model: { ...model, t: "none" },
            msgCmd: [playSound(APP_SOUND.navBackwardMin)],
          };
        }
      }
    }
  }
};

const updateFromMsg: Module["update"] = (input) => {
  const { msg, model } = input;

  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "play": {
      return { model };
    }

    case "builder": {
      return { model };
    }

    case "msgEvt": {
      const msgGame = withId(msg.c);
      return {
        model,
        msgGame: [msgGame],
      };
    }
  }
};

//
//
//
//
//
//
//
//

const subscriptions: Module["subscriptions"] = (input) => {
  switch (input.modelGame.t) {
    case "play": {
      return Sub.tag(
        "play",
        PlayClient.subscriptions({
          ctx: { ...input.ctx, onQuit() {}, puzzles: input.model.puzzles },
          modelGame: input.modelGame.c,
          model: input.model.t === "play" ? input.model.c : PlayClient.init,
        })
      );
    }
    case "builder": {
      return Sub.tag(
        "builder",
        BuilderClient.subscriptions({
          ctx: { ...input.ctx, onQuit() {}, puzzles: input.model.puzzles },
          modelGame: input.modelGame.c,
          model:
            input.model.t === "builder" ? input.model.c : BuilderClient.init,
        })
      );
    }

    default: {
      return Sub.None;
    }
  }
};

//
//
// View
//
//

const View: Module["View"] = (input) => {
  const { modelGame, dispatch } = input;

  const ctx: FlowClientCtx = {
    ...input.ctx,
    puzzles: input.model.puzzles,
    onQuit: () =>
      dispatch({
        t: "msgEvt",
        c: {
          t: "user-changed-mode",
          mode: null,
          userId: input.ctx.currentUserId,
        },
      }),
  };

  switch (modelGame.t) {
    case null: {
      return (
        <MainMenuScreen.View
          renderCoverArt={(props) => <CoverArt {...props} />}
          ctx={ctx}
          title="Flow"
          buttons={[
            {
              renderIcon: (props) => <IconGamepad {...props} />,
              title: "Play",
              description: "Start playing puzzles",
              onClick: () => {
                dispatch({
                  t: "msgEvt",
                  c: {
                    t: "user-changed-mode",
                    mode: "play",
                    userId: input.ctx.currentUserId,
                  },
                });
              },
            },
            {
              renderIcon: (props) => <IconScrewdriverWrench {...props} />,
              title: "Puzzle builder",
              description: "Build new puzzles to play",
              onClick: () => {
                dispatch({
                  t: "msgEvt",
                  c: {
                    t: "user-changed-mode",
                    mode: "builder",
                    userId: input.ctx.currentUserId,
                  },
                });
              },
            },
          ]}
        />
      );
    }

    case "builder": {
      return (
        <BuilderClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "builder", c })}
          modelGame={modelGame.c}
          model={
            input.model.t === "builder" ? input.model.c : BuilderClient.init
          }
        />
      );
    }

    case "play": {
      return (
        <PlayClient.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "play", c })}
          modelGame={modelGame.c}
          model={input.model.t === "play" ? input.model.c : PlayClient.init}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = ({
  ctx,
  dispatch,
  modelGame,
  msgGame,
}) => {
  switch (msgGame.t) {
    case "play": {
      switch (modelGame.t) {
        case "play": {
          return (
            <PlayClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {}, puzzles: {} }}
              dispatch={(c) => dispatch({ t: "play", c })}
              modelGame={modelGame.c}
              msgGame={msgGame.c}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    case "builder": {
      switch (modelGame.t) {
        case "builder": {
          return (
            <BuilderClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {}, puzzles: {} }}
              dispatch={(c) => dispatch({ t: "builder", c })}
              modelGame={modelGame.c}
              msgGame={msgGame.c}
            />
          );
        }

        default: {
          return null;
        }
      }
    }

    default: {
      return null;
    }
  }
};

export const Flow: Module = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
};
