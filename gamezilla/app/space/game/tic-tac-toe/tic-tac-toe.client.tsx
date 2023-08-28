import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCmd } from "gamezilla/app/@SHARED/client";
import { SpaceGameClient, SpaceViewCtx } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./tic-tac-toe.core";
import { ViewCoverArt } from "./tic-tic-toe/tic-tac-toe-ui";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

type Client = SpaceGameClient<
  ClientModel,
  ServerModel,
  ClientMsg,
  ToClient,
  ToServer
>;

//
//
//
// Model
//
//
//

export const init: Client["init"] = () => {
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
    const { result } = msg;

    if (result.t === "err") {
      return { model };
    }

    const synced = syncWithServer({
      ctx,
      client: model,
      server: result.value,
    });

    return synced;
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

export const syncWithServer: Client["syncWithServer"] = ({
  client = { t: "none" },
  server,
  ctx,
}) => {
  if (server.t === "none") {
    return { model: { t: "none" } };
  }

  if (server.t === "vs-user") {
    const clientChild = client?.t === "vs-user" ? client.c : VsUser.init;

    return {
      model: {
        t: "vs-user",
        c: VsUser.syncWithServer(clientChild, server.c),
      },
    };
  }

  if (server.t === "vs-bot") {
    return {
      model: {
        t: "vs-bot",
        c: VsBot.syncWithServer({
          now: ctx.now,
          client: client?.t === "vs-bot" ? client.c : undefined,
          server: server.c,
        }),
      },
    };
  }

  return { model: { t: "none" } };
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
