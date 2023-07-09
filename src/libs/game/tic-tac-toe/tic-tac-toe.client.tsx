import {
  ClientAppMsg,
  Ctx,
  MainMenuScreen,
  SpaceCtx,
  SpaceViewCtx,
  mainMenuButtons,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/shared/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./tic-tac-toe.shared";
import { ViewCoverArt } from "./tic-tic-toe/tic-tac-toe-ui";
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

export const init: Model = {
  t: "none",
};

//
//
// Update
//
//
//

export type Msg = ClientMsg;

export const update = ({
  sendToServer,
  msg,
  model,
  ctx,
}: {
  sendToServer: (msg: ToServer) => Cmd;
  ctx: SpaceCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "input-mode") {
    return { model, cmd: sendToServer(msg) };
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update(
      {
        sendToServer: (c) => sendToServer({ t: "vs-user", c }),
      },
      msg.c,
      model.c
    );
    return {
      model: { t: "vs-user", c: updated[0] },
      cmd: Cmd.tag_("vs-user", updated[1]),
    };
  }

  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({
      ctx,
      msg: msg.c,
      model: model.c,
      sendToServer: (c) => sendToServer({ t: "vs-bot", c }),
    });

    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
      msgs: ClientAppMsg.tag("vs-bot", updated.msgs),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
  msgs?: ClientAppMsg[];
} => {
  if (msg.t === "input-mode") {
    const { result } = msg;

    if (result.t === "err") {
      return { model };
    }

    const modelNew = syncWithServer({
      ctx,
      clientModel: model,
      serverModel: result.value,
    });

    return { model: modelNew };
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
      cmd: Cmd.tag_("vs-bot", updated.cmd),
      msgs: updated.msgs,
    };
  }

  return { model };
};

export const syncWithServer = ({
  clientModel,
  serverModel,
  ctx,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  if (serverModel.t === "none") {
    return { t: "none" };
  }

  if (serverModel.t === "vs-user") {
    const clientModelChild =
      clientModel.t === "vs-user" ? clientModel.c : VsUser.init;

    return {
      t: "vs-user",
      c: VsUser.syncWithServer(clientModelChild, serverModel.c),
    };
  }

  if (serverModel.t === "vs-bot") {
    const clientModelChild =
      clientModel.t === "vs-bot" ? clientModel.c : VsBot.init({ userId: null });

    return {
      t: "vs-bot",
      c: VsBot.syncWithServer({
        now: ctx.now,
        client: clientModelChild,
        server: serverModel.c,
      }),
    };
  }

  return clientModel;
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: { model: Model }): Sub<Msg> => {
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
  $send,
}: {
  ctx: SpaceViewCtx;
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const onQuit = () => $send({ t: "input-mode", mode: "none" });

  if (model.t === "none") {
    return (
      <MainMenuScreen
        title="Tic-Tac-Toe"
        ctx={ctx}
        renderCoverArt={(props) => <ViewCoverArt {...props} />}
        buttons={[
          mainMenuButtons.playFriend({
            onClick: () => $send({ t: "input-mode", mode: "vs-user" }),
          }),
          mainMenuButtons.playComputer({
            onClick: () => $send({ t: "input-mode", mode: "vs-bot" }),
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
        $send={(c) => $send({ t: "vs-user", c })}
      />
    );
  }

  if (model.t === "vs-bot") {
    return (
      <VsBot.View
        goBack={onQuit}
        ctx={ctx}
        model={model.c}
        $send={(c) => $send({ t: "vs-bot", c })}
      />
    );
  }

  const check: never = model;
  return check;
};
