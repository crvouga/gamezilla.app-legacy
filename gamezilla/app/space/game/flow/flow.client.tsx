import { Sub, chain } from "gamezilla/@SHARED/core";
import { IconGamepad, IconScrewdriverWrench } from "gamezilla/app/@SHARED/ui";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import { MainMenuScreen } from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./@SHARED/flow-cover-art";
import { FlowViewCtx } from "./@SHARED/flow-ctx";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./flow.core";
import { PlayClient } from "./play";
import { PuzzleBuilderClient } from "./puzzle-builder";
import {
  APP_SOUND,
  playSound,
  sendToServer,
} from "gamezilla/app/@SHARED/client";

type Client = SpaceGameClient<ClientModel, ClientMsg, ToClient, ToServer>;

const PuzzleBuilder = SpaceGameClient.tag(
  "puzzle-builder",
  PuzzleBuilderClient
);

const Play = SpaceGameClient.tag("play", PlayClient);

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
  switch (msg.t) {
    case "input-mode": {
      const { result } = msg;
      if (result.t === "err") {
        return { model };
      }
      return chain(
        model,

        (model) => {
          if (model.t === "none") {
            return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
          }
          return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
        }
      );
    }

    case "play": {
      return { model };
    }

    case "puzzle-builder": {
      return { model };
    }
  }
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
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
    <MainMenuScreen
      renderCoverArt={(props) => <ViewCoverArt {...props} />}
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
