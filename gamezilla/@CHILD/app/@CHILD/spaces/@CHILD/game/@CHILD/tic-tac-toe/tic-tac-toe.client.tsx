import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game";
import { GameClient } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client";
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { Sub } from "gamezilla/@SHARED/core";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUser from "./@CHILD/vs-user/vs-user.client";
import { CoverArt } from "./@SHARED/tic-tic-toe/tic-tac-toe-ui";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./tic-tac-toe.core";

type Client = GameClient<{
  ClientModel: ClientModel;
  ClientMsg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameEvent: null;
  GameState: null;
  ClientCtx: SpaceClientCtx;
  ClientCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  ClientEvent: SpaceClientEvent;
}>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = ({ model }) => {
  if (model) {
    return { model };
  }

  return { model: { t: "none" } };
};

//
//
// Update
//
//
//

export const update: Client["update"] = (input) => {
  return init(input);
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = () => {
  return Sub.None;
};

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  model,
  emit,
}: {
  ctx: SpaceClientCtx;
  model: ClientModel;
  emit: (msg: ClientMsg) => void;
}) => {
  const onQuit = () => emit({ t: "input-mode", mode: "none" });

  if (model.t === "none") {
    return (
      <MainMenuScreen.View
        title="Tic-Tac-Toe"
        ctx={ctx}
        renderCoverArt={(props) => <CoverArt {...props} />}
        buttons={[
          MainMenuScreen.buttons.playFriend({
            onClick: () => emit({ t: "input-mode", mode: "vs-user" }),
          }),
          MainMenuScreen.buttons.playComputer({
            onClick: () => emit({ t: "input-mode", mode: "vs-bot" }),
          }),
        ]}
      />
    );
  }

  if (model.t === "vs-user") {
    return (
      <VsUser.View
        onCloseGame={onQuit}
        ctx={ctx}
        model={model.c}
        emit={(c) => emit({ t: "vs-user", c })}
      />
    );
  }

  if (model.t === "vs-bot") {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        emit={(c) => emit({ t: "vs-bot", c })}
      />
    );
  }

  const check: never = model;
  return check;
};
