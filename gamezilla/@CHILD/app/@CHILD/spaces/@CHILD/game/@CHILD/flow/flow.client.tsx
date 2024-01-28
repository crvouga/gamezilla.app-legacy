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
  GameEvent,
  GameState,
  ToClient,
  ToServer,
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
  ToClient: ToClient;
  ToServer: ToServer;
  //
  GameEvent: GameEvent;
  GameState: GameState;
  //
  Ctx: SpaceClientCtx;
  //
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvent: SpaceClientEvent;
  InCmd: null;
  OutEvent: null;
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
    (model) => updateFromGameEvent({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = (input) => {
  const { model, gameState, gameEvent, ctx, cmd, event, fromServer, msg } =
    input;

  switch (gameState.t) {
    case null: {
      return { model };
    }

    case "play": {
      const updated = PlayClient.update({
        ctx: { ...ctx, onQuit: () => {}, puzzles: model.puzzles },
        gameState: gameState.c,
        model: model.t === "play" ? model.c : PlayClient.init,
        cmd: cmd,
        event: event,
        fromServer: fromServer?.t === "play" ? fromServer.c : null,
        gameEvent:
          gameEvent?.t === "play" ? { ...gameEvent, ...gameEvent.c } : null,
        msg: msg?.t === "play" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "play",
        (cmd) => ClientCmd.tag("play", cmd),
        updated
      );

      return { ...tagged, model: { ...tagged.model, puzzles: model.puzzles } };
    }

    case "builder": {
      const updated = BuilderClient.update({
        ctx: { ...ctx, onQuit: () => {}, puzzles: model.puzzles },
        gameState: gameState.c,
        model: model.t === "builder" ? model.c : BuilderClient.init,
        cmd: cmd,
        event: event,
        fromServer: fromServer?.t === "builder" ? fromServer.c : null,
        gameEvent:
          gameEvent?.t === "builder" ? { ...gameEvent, ...gameEvent.c } : null,
        msg: msg?.t === "builder" ? msg.c : null,
      });

      const tagged = GameClientModule.tagOutput(
        "builder",
        (cmd) => ClientCmd.tag("builder", cmd),
        updated
      );

      return { ...tagged, model: { ...tagged.model, puzzles: model.puzzles } };
    }
  }
};

const updateFromGameEvent: Module["update"] = (input) => {
  const { gameEvent, model } = input;

  if (!gameEvent) {
    return { model };
  }

  switch (gameEvent.t) {
    case "builder":
    case "play": {
      return { model };
    }

    case "user-changed-mode": {
      switch (gameEvent.mode) {
        case "play": {
          return {
            model: { ...model, t: "play", c: PlayClient.init },
            cmd: [playSound(APP_SOUND.navForwardMin)],
          };
        }

        case "builder": {
          return {
            model: {
              ...model,
              t: "builder",
              c: BuilderClient.init,
            },
            cmd: [playSound(APP_SOUND.navForwardMin)],
          };
        }

        case null: {
          return {
            model: { ...model, t: "none" },
            cmd: [playSound(APP_SOUND.navBackwardMin)],
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

    case "event": {
      const gameEvent = withId(msg.c);
      return {
        model,
        gameEvent: [gameEvent],
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
  switch (input.gameState.t) {
    case "play": {
      return Sub.tag(
        "play",
        PlayClient.subscriptions({
          ctx: { ...input.ctx, onQuit() {}, puzzles: input.model.puzzles },
          gameState: input.gameState.c,
          model: input.model.t === "play" ? input.model.c : PlayClient.init,
        })
      );
    }
    case "builder": {
      return Sub.tag(
        "builder",
        BuilderClient.subscriptions({
          ctx: { ...input.ctx, onQuit() {}, puzzles: input.model.puzzles },
          gameState: input.gameState.c,
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
  const { gameState, dispatch } = input;

  const ctx: FlowClientCtx = {
    ...input.ctx,
    puzzles: input.model.puzzles,
    onQuit: () =>
      dispatch({
        t: "event",
        c: {
          t: "user-changed-mode",
          mode: null,
          userId: input.ctx.currentUserId,
        },
      }),
  };

  switch (gameState.t) {
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
                  t: "event",
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
                  t: "event",
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
          gameState={gameState.c}
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
          gameState={gameState.c}
          model={input.model.t === "play" ? input.model.c : PlayClient.init}
        />
      );
    }
  }
};

const ViewFeedItem: Module["ViewFeedItem"] = ({
  ctx,
  dispatch,
  gameState,
  gameEvent,
}) => {
  switch (gameEvent.t) {
    case "play": {
      switch (gameState.t) {
        case "play": {
          return (
            <PlayClient.ViewFeedItem
              ctx={{ ...ctx, onQuit() {}, puzzles: {} }}
              dispatch={(c) => dispatch({ t: "play", c })}
              gameState={gameState.c}
              gameEvent={gameEvent.c}
            />
          );
        }
        default: {
          return null;
        }
      }
    }

    default: {
      return <div></div>;
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
