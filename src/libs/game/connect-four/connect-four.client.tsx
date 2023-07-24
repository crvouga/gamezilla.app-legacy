import { Cmd, Posix, Sub } from "@gamezilla/core";
import { ClientCtx } from "@gamezilla/shared/client";
import {
  GameSpaceClientCtx,
  GameSpaceViewCtx,
  MainMenuScreen,
  mainMenuButtons,
} from "@gamezilla/shared/game-space";
import { ViewCoverArt } from "./connect-four-ui";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./connect-four.core";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = { t: "none" };

//
//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  ctx,
  msg,
  model,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: GameSpaceClientCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    return { model, cmd: sendToServer(msg) };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({
      sendToServer: (c) => sendToServer({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
      ctx,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.tag_("vs-user", updated.cmd),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      ctx,
      sendToServer: (c) => sendToServer({ t: "vs-bot", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  model,
  msg,
}: {
  ctx: GameSpaceClientCtx;
  msg: ToClient;
  model: Model;
}): [Model, Cmd<Msg>] => {
  switch (msg.t) {
    case "input-mode": {
      if (msg.result.t === "err") {
        return [model, Cmd.None];
      }

      const merged = syncWithServer({
        clientModel: model,
        serverModel: msg.result.value,
        ctx,
      });
      return [merged, Cmd.None];
    }

    case "vs-user": {
      if (model.t === "vs-user") {
        const updated = VsUser.updateFromServer({
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "vs-user", c: updated.model },
          Cmd.tag_("vs-user", updated.cmd),
        ];
      }
      return [model, Cmd.None];
    }

    case "vs-bot": {
      if (model.t === "vs-bot") {
        const updated = VsBot.updateFromServer({
          ctx,
          msg: msg.c,
          model: model.c,
        });
        return [
          { t: "vs-bot", c: updated.model },
          Cmd.tag_("vs-bot", updated.cmd ?? Cmd.None),
        ];
      }
      return [model, Cmd.None];
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
  ctx,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
  ctx: GameSpaceViewCtx;
}) => {
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

export const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
}: {
  ctx: ClientCtx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  switch (serverModel.t) {
    case "none": {
      return serverModel;
    }

    case "vs-bot": {
      if (clientModel.t === "vs-bot") {
        return {
          t: "vs-bot",
          c: VsBot.syncWithServer({
            ctx,
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }

      return {
        t: "vs-bot",
        c: VsBot.syncWithServer({
          ctx,
          clientModel: VsBot.init(serverModel.c),
          serverModel: serverModel.c,
        }),
      };
    }

    case "vs-user": {
      if (clientModel.t === "vs-user") {
        return {
          t: "vs-user",
          c: VsUser.syncWithServer({
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }

      return {
        t: "vs-user",
        c: VsUser.syncWithServer({
          clientModel: VsUser.init(serverModel.c),
          serverModel: serverModel.c,
        }),
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

export const subscriptions = (
  intervalId: string,
  now: Posix,
  model: Model
): Sub<Msg> => {
  switch (model.t) {
    case "none": {
      return Sub.None;
    }

    case "vs-bot": {
      return Sub.tag_("vs-bot", VsBot.subscriptions(intervalId, now, model.c));
    }

    case "vs-user": {
      return Sub.tag_("vs-user", VsUser.subscriptions(model.c));
    }
  }
};
