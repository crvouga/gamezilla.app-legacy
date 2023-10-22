import { Eff, Sub, andThen, chain, p } from "gamezilla/@SHARED/core";
import { APP_SOUND, ClientCmd, playSound } from "gamezilla/app/@SHARED/client";
import { SpaceGameClient, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./tic-tac-toe.core";
import { ViewCoverArt } from "./tic-tic-toe/tic-tac-toe-ui";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

type Client = SpaceGameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  null,
  null
>;

//
//
//
// Model
//
//
//

export const init = (): { model: ClientModel } => {
  return { model: { t: "none" } };
};

//
//
// Update
//
//
//

export const update: Client["update"] = ({ msg, model, ctx }) => {
  if (msg.t === "input-mode") {
    return { model, cmd: [{ t: "send-to-server", msg }] };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update(msg.c, model.c);
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: ClientCmd.tag("vs-user", updated.cmd),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      ctx,
      msg: msg.c,
      model: model.c,
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.t("vs-bot", updated.eff),
      evt: updated.evt,
      cmd: ClientCmd.tag("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = ({
  ctx,
  msg,
  model,
}) => {
  if (msg.t === "input-mode") {
    return chain(
      model,
      (model) => {
        const { result } = msg;

        if (result.t === "err") {
          return { model };
        }

        return { model };
      },
      (model) => {
        if (model.t === "none") {
          return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
        }
        return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
      }
    );
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromServer({ ctx }, msg.c, model.c);
    return {
      model: { t: "vs-user", c: updated[0] },
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
    };
  }

  return { model };
};

export const updateFromEvt: Client["updateFromEvt"] = (input) => {
  return input;
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
  dispatch,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const onQuit = () => dispatch({ t: "input-mode", mode: "none" });

  if (model.t === "none") {
    return (
      <MainMenuScreen
        title="Tic-Tac-Toe"
        ctx={ctx}
        renderCoverArt={(props) => <ViewCoverArt {...props} />}
        buttons={[
          mainMenuButtons.playFriend({
            onClick: () => dispatch({ t: "input-mode", mode: "vs-user" }),
          }),
          mainMenuButtons.playComputer({
            onClick: () => dispatch({ t: "input-mode", mode: "vs-bot" }),
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
        dispatch={(c) => dispatch({ t: "vs-user", c })}
      />
    );
  }

  if (model.t === "vs-bot") {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        dispatch={(c) => dispatch({ t: "vs-bot", c })}
      />
    );
  }

  const check: never = model;
  return check;
};
