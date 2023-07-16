import {
  Ctx,
  SpaceCtx,
  SpaceViewCtx,
  ViewCtx,
  MainMenuScreen,
  mainMenuButtons,
} from "@gamezilla/shared/client";
import { Cmd, Sub } from "@gamezilla/core";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./gomoku.shared";
import { ViewCoverArt } from "./gomoku/gomoku-ui";
import * as VsBot from "./vs-bot/vs-bot.client";
import * as VsUser from "./vs-user/vs-user.client";

//
//
//
// model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  t: "none",
};

//
//
//
// update
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
  ctx: SpaceCtx;
  sendToServer: (m: ToServer) => Cmd;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    return { model, cmd: sendToServer(msg) };
  }

  if (model.t === "vs-bot" && msg.t === "vs-bot") {
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

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.update({
      sendToServer: (c) => sendToServer({ t: "vs-user", c }),
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.tag_("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  model,
  msg,
}: {
  ctx: SpaceCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "input-mode") {
    if (msg.result.t === "err") {
      return { model };
    }
    const merged = syncWithServer({
      ctx,
      clientModel: model,
      serverModel: msg.result.value,
    });
    return { model: merged };
  }

  if (model.t === "vs-bot" && msg.t === "vs-bot") {
    const updated = VsBot.updateFromServer({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      cmd: Cmd.tag_("vs-bot", updated.cmd),
    };
  }

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.updateFromServer({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      cmd: Cmd.tag_("vs-user", updated.cmd),
    };
  }

  return { model };
};

export const syncWithServer = ({
  ctx,
  clientModel,
  serverModel,
}: {
  ctx: Ctx;
  clientModel: ClientModel;
  serverModel: ServerModel;
}): ClientModel => {
  switch (serverModel.t) {
    case "none": {
      return { t: "none" };
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
          clientModel: VsBot.init({ userId: null }),
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
          clientModel: VsUser.init({ white: null, black: null }),
          serverModel: serverModel.c,
        }),
      };
    }
  }
};

//
//
//
// subscriptions
//
//
//

export const subscriptions = (ctx: Ctx, model: Model): Sub<Msg> => {
  switch (model.t) {
    case "vs-bot": {
      return Sub.tag_("vs-bot", VsBot.subscriptions(ctx, model.c));
    }

    case "vs-user": {
      return Sub.None;
    }

    case "none": {
      return Sub.None;
    }
  }
};

//
//
//
// view
//
//
//

export const view = ({
  model,
  ctx,
  gameSpaceCtx,
  dispatch,
}: {
  model: Model;
  ctx: ViewCtx;
  gameSpaceCtx: SpaceViewCtx;
  dispatch: (m: Msg) => void;
}) => {
  switch (model.t) {
    case "none": {
      return (
        <MainMenuScreen
          title="Gomoku"
          renderCoverArt={(props) => <ViewCoverArt {...props} />}
          ctx={gameSpaceCtx}
          buttons={[
            mainMenuButtons.playComputer({
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  userId: ctx.currentUserId,
                  mode: "vs-bot",
                }),
            }),

            mainMenuButtons.playFriend({
              onClick: () =>
                dispatch({
                  t: "input-mode",
                  userId: ctx.currentUserId,
                  mode: "vs-user",
                }),
            }),
          ]}
        />
      );
    }

    case "vs-bot": {
      return (
        <VsBot.View
          model={model.c}
          ctx={ctx}
          onBack={() =>
            dispatch({
              t: "input-mode",
              mode: "none",
              userId: ctx.currentUserId,
            })
          }
          dispatch={(c) => dispatch({ t: "vs-bot", c })}
        />
      );
    }

    case "vs-user": {
      return (
        <VsUser.View
          model={model.c}
          ctx={ctx}
          onCancel={() =>
            dispatch({
              t: "input-mode",
              mode: "none",
              userId: ctx.currentUserId,
            })
          }
          dispatch={(c) => dispatch({ t: "vs-user", c })}
        />
      );
    }
  }
};

export const coverArt = ViewCoverArt;
