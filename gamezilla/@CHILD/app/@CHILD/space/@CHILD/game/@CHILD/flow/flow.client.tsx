import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/architecture/game-client-v2";
import { SpaceClientEvt } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { ClientCmd, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconGamepad,
  IconScrewdriverWrench,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { Sub } from "gamezilla/@SHARED/core";
import { CoverArt } from "./@SHARED/flow-cover-art";
import { FlowClientCtx } from "./@SHARED/flow-ctx";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./flow.core";

type Client = GameClientModule<{
  Model: ClientModel;
  Msg: ClientMsg;
  //
  ToClient: ToClient;
  ToServer: ToServer;
  //
  GameEvent: null;
  GameState: null;
  //
  Ctx: FlowClientCtx;
  //
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvt: SpaceClientEvt;
  InCmd: null;
  OutEvt: null;
}>;

export const init: Client["init"] = {
  t: "none",
};

export const update: Client["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Client["update"] = (input) => {
  return { model: input.model };
};

export const updateFromMsg: Client["update"] = (input) => {
  const { msg, model } = input;

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
};

//
//
//
//
//
//
//
//

export const subscriptions: Client["subscriptions"] = (_input) => {
  return Sub.None;
};

//
//
// View
//
//

export const View: Client["View"] = (input) => {
  const { dispatch } = input;
  const ctx: FlowClientCtx = {
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
