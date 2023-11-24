import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import {
  GameClient,
  SpaceClientCtx,
  SpaceClientEvt,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import { ClientCmd, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub, chain } from "gamezilla/@SHARED/core";
import { PlayClient } from "./@CHILD/play";
import { PuzzleBuilderClient } from "./@CHILD/puzzle-builder";
import { CoverArt } from "./@SHARED/flow-cover-art";
import { FlowViewCtx } from "./@SHARED/flow-ctx";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./flow.core";

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

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model };
  }
  return {
    model: {
      t: "none",
    },
  };
};

export const update: Client["update"] = (input) => {
  return chain(init(input), (model) => {
    const { msg } = input;

    if (!msg) {
      return { model };
    }

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
  });
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
