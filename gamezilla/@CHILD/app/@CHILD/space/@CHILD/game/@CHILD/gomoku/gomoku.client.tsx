import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCtx, ViewCtx } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  SpaceClientCtx,
  SpaceViewCtx,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  MainMenuScreen,
  mainMenuButtons,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import {
  ClientModel,
  ClientMsg,
  ServerModel,
  ToClient,
  ToServer,
} from "./gomoku.core";
import { CoverArt } from "./@SHARED/gomoku/gomoku-ui";
import * as VsBot from "./@CHILD/vs-bot/vs-bot.client";
import * as VsUser from "./@CHILD/vs-user/vs-user.client";

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
  ctx,
  msg,
  model,
}: {
  ctx: SpaceClientCtx;
  msg: Msg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "input-mode") {
    return { model };
  }

  if (model.t === "vs-bot" && msg.t === "vs-bot") {
    const updated = VsBot.update({
      ctx,
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.t("vs-bot", updated.eff),
    };
  }

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.update({
      msg: msg.c,
      model: model.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.t("vs-user", updated.eff),
    };
  }

  return { model };
};

export const updateFromServer = ({
  ctx,
  model,
  msg,
}: {
  ctx: SpaceClientCtx;
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  if (msg.t === "input-mode") {
    if (msg.result.t === "err") {
      return { model };
    }
    const merged = mergeWithServer({
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
      eff: Eff.t("vs-bot", updated.eff),
    };
  }

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.updateFromServer({
      model: model.c,
      msg: msg.c,
    });
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.t("vs-user", updated.eff),
    };
  }

  return { model };
};

export const mergeWithServer = ({
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
      return { t: "none" };
    }

    case "vs-bot": {
      if (clientModel.t === "vs-bot") {
        return {
          t: "vs-bot",
          c: VsBot.mergeWithServer({
            ctx,
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }
      return {
        t: "vs-bot",
        c: VsBot.mergeWithServer({
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
          c: VsUser.mergeWithServer({
            clientModel: clientModel.c,
            serverModel: serverModel.c,
          }),
        };
      }
      return {
        t: "vs-user",
        c: VsUser.mergeWithServer({
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

export const subscriptions = (ctx: ClientCtx, model: Model): Sub<Msg> => {
  switch (model.t) {
    case "vs-bot": {
      return Sub.tag("vs-bot", VsBot.subscriptions(ctx, model.c));
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
  spaceCtx,
  dispatch,
}: {
  model: Model;
  ctx: ViewCtx;
  spaceCtx: SpaceViewCtx;
  dispatch: (m: Msg) => void;
}) => {
  switch (model.t) {
    case "none": {
      return (
        <MainMenuScreen
          title="Gomoku"
          renderCoverArt={(props) => <CoverArt {...props} />}
          ctx={spaceCtx}
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

export const coverArt = CoverArt;
