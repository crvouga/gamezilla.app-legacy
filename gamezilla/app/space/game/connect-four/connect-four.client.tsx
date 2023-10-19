import { Eff, Sub, andThen, p } from "gamezilla/@SHARED/core";
import { SpaceGameClient } from "gamezilla/app/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt } from "./connect-four-cover-art";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";
import { APP_SOUND, ClientCmd, playSound } from "gamezilla/app/@SHARED/client";

export const ConnectFour = () => {};

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
  return {
    model: { t: "none" },
  };
};

//
//
//
// Update
//
//
//

export const update: Client["update"] = ({ ctx, msg, model }) => {
  if (msg.t === "input-mode") {
    return {
      model,
      cmd: [{ t: "send-to-server", msg }],
    };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.t("vs-user", updated.eff),
      cmd: ClientCmd.tag("vs-user", updated.cmd),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({ ctx, msg: msg.c, model: model.c });
    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.t("vs-bot", updated.eff),
      cmd: ClientCmd.tag("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer: Client["updateFromServer"] = (input) => {
  const { ctx, model, msg } = input;

  if (msg.t === "input-mode") {
    return p(
      { model },
      andThen((model) => {
        if (msg.result.t === "err") {
          return { model };
        }

        const merged = mergeWithServer({
          ...input,
          client: model,
          server: msg.result.value,
          ctx,
        });

        return merged;
      }),
      andThen((model) => {
        if (model.t === "none") {
          return { model, cmd: [playSound(APP_SOUND.navBackwardMin)] };
        }
        return { model, cmd: [playSound(APP_SOUND.navForwardMin)] };
      })
    );
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.updateFromServer({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.t("vs-user", updated.eff),
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
      eff: Eff.t("vs-bot", updated.eff ?? Eff.None),
      cmd: ClientCmd.tag("vs-bot", updated.cmd),
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
// View
//
//
//

export const View: Client["View"] = ({ model, dispatch, ctx }) => {
  const onQuit = () => dispatch({ t: "input-mode", mode: "none" });

  switch (model.t) {
    case "none": {
      return (
        <MainMenuScreen
          ctx={ctx}
          title="Connect Four"
          renderCoverArt={(props) => <ViewCoverArt {...props} />}
          buttons={[
            mainMenuButtons.playFriend({
              onClick: () => dispatch({ mode: "vs-user", t: "input-mode" }),
            }),
            mainMenuButtons.playComputer({
              onClick: () => dispatch({ mode: "vs-bot", t: "input-mode" }),
            }),
          ]}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "vs-user", c })}
          model={model.c}
          onQuit={onQuit}
        />
      );
    }

    case "vs-bot": {
      return (
        <VsBot.View
          ctx={ctx}
          dispatch={(c) => dispatch({ t: "vs-bot", c })}
          model={model.c}
          onQuit={onQuit}
        />
      );
    }
  }
};

export const mergeWithServer: Client["mergeWithServer"] = ({
  ctx,
  client: client_,
  server,
}) => {
  const client: ClientModel = client_ ?? { t: "none" };
  switch (server.t) {
    case "none": {
      return { model: server };
    }

    case "vs-bot": {
      const sync = VsBot.mergeWithServer({
        ctx,
        clientModel:
          client.t === "vs-bot"
            ? client.c
            : VsBot.init({ player: ctx.currentUserId }),
        serverModel: server.c,
      });
      return {
        model: { t: "vs-bot", c: sync.model },
        eff: Eff.t("vs-bot", sync.eff),
      };
    }

    case "vs-user": {
      return {
        model: {
          t: "vs-user",
          c: VsUser.mergeWithServer({
            client: client.t === "vs-user" ? client.c : undefined,
            server: server.c,
          }),
        },
      };
    }
  }
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Client["subscriptions"] = (input) => {
  switch (input.model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag(
        "vs-bot",
        VsBot.subscriptions(input.intervalId, input.ctx.now, input.model.c)
      );
    }

    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(input.model.c));
    }
  }
};
