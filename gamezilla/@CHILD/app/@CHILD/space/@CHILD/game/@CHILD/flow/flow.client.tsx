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
import {
  ClientModel,
  ClientMsg,
  GameEvent,
  GameState,
  ToClient,
  ToServer,
} from "./flow.core";

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
  Ctx: FlowClientCtx;
  //
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvt: SpaceClientEvt;
  InCmd: null;
  OutEvt: null;
}>;

const init: Module["init"] = {
  t: "none",
};

const update: Module["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateChild({ ...input, model })
  );
};

const updateChild: Module["update"] = (input) => {
  return { model: input.model };
};

const updateFromMsg: Module["update"] = (input) => {
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

const subscriptions: Module["subscriptions"] = (_input) => {
  return Sub.None;
};

//
//
// View
//
//

const View: Module["View"] = (input) => {
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

const ViewFeedItem: Module["ViewFeedItem"] = () => {
  return <div></div>;
};

export const Flow: Module = {
  init,
  subscriptions,
  update,
  View,
  ViewFeedItem,
};
