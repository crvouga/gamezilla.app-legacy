import { Sub, chain, isErr } from "gamezilla/@SHARED/core";
import {
  APP_SOUND,
  ClientCmd,
  playSound,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import { CoverArt } from "./@SHARED/flow-cover-art";
import { FlowViewCtx } from "./@SHARED/flow-ctx";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./flow.core";
import { PlayClient } from "./@CHILD/play";
import { PuzzleBuilderClient } from "./@CHILD/puzzle-builder";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  //
  ToClient: ToClient;
  ToServer: ToServer;
  //
  GameEvent: null;
  GameState: null;
  //
  ClientCtx: SpaceClientCtx;
  ViewCtx: FlowViewCtx;
  //
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvt: SpaceClientEvt;
}>;

const PuzzleBuilder = GameClient.tag("puzzle-builder", PuzzleBuilderClient);

const Play = GameClient.tag("play", PlayClient);

export const init: Client["init"] = () => {
  return {
    model: {
      t: "none",
    },
  };
};

export const update: Client["update"] = (input) => {
  const { model, msg } = input;

  switch (msg.t) {
    case "input-mode": {
      return { model, cmd: [sendToServer(msg)] };
    }

    case "play": {
      return { model };
    }

    case "puzzle-builder": {
      return { model };
    }
  }
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { model, msg } = input;
  const initial = model ? { model } : init(input);
  switch (msg.t) {
    case "input-mode": {
      const { result } = msg;
      if (isErr(result)) {
        return initial;
      }
      return chain(initial, (model) => {
        if (model.t === "none") {
          return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
        }
        return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
      });
    }

    case "play": {
      return initial;
    }

    case "puzzle-builder": {
      return initial;
    }
  }
};

export const updateFromEvent: Client["updateFromEvent"] = (input) => {
  const { model } = input;
  return { model };
};

//
//
//
//
//
//
//
//

export const subscriptions: Client["subscriptions"] = (input) => {
  return Sub.None;
};

//
//
// View
//
//

export const View: Client["View"] = (input) => {
  const { dispatch } = input;
  const ctx: FlowViewCtx = {
    ...input.ctx,
    onExit: () => dispatch({ t: "input-mode", mode: "none" }),
  };

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
            dispatch({ t: "input-mode", mode: "play" });
          },
        },
        {
          renderIcon: (props) => <IconScrewdriverWrench {...props} />,
          title: "Puzzle builder",
          description: "Build new puzzles to play",
          onClick: () => {
            dispatch({ t: "input-mode", mode: "puzzle-builder" });
          },
        },
      ]}
    />
  );
};
