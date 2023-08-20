import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientAppMsg } from "gamezilla/app/@SHARED/client";
import { VDom } from "gamezilla/app/@SHARED/ui";
import { SpaceClientCtx, SpaceEvt, SpaceViewCtx } from "../space";

/**
 * Represents all the functions needed to run a game client side
 */
export type GameClient<
  Model,
  ServerModel,
  Msg,
  ToClient,
  ToServer,
  ViewCtx = SpaceViewCtx,
  Ctx = SpaceClientCtx
> = {
  init: (input: { ctx: Ctx; sendToServer: (m: ToServer) => Eff }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
  };

  update: (input: {
    ctx: Ctx;
    sendToServer: (m: ToServer) => Eff;
    msg: Msg;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
  };

  updateFromServer: (input: {
    ctx: Ctx;
    sendToServer: (m: ToServer) => Eff;
    msg: ToClient;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
  };

  /**
   * Handles messages from the game space like users leaving and joining
   */
  updateFromEvent: (input: {
    ctx: SpaceViewCtx;
    sendToServer: (m: ToServer) => Eff;
    msg: SpaceEvt;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
  };

  syncWithServer: (input: {
    ctx: Ctx;
    sendToServer: (m: ToServer) => Eff;
    server: ServerModel;
    client?: Model | null;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
  };

  subscriptions: (input: {
    intervalId: string;
    ctx: Ctx;
    model: Model;
  }) => Sub<Msg>;

  View: (input: {
    ctx: ViewCtx;
    dispatch: (msg: Msg) => void;
    model: Model;
  }) => VDom;
};

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <
  T extends string,
  Model,
  ServerModel,
  Msg,
  ToClient,
  ToServer,
  ViewCtx
>(
  tag: T,
  client: GameClient<Model, ServerModel, Msg, ToClient, ToServer, ViewCtx>
): GameClient<
  { t: T; c: Model },
  { t: T; c: ServerModel },
  { t: T; c: Msg },
  { t: T; c: ToClient },
  { t: T; c: ToServer },
  ViewCtx
> => {
  return {
    init: (input) => {
      const initial = client.init({
        ...input,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        msgs: initial.msgs,
      };
    },
    update: (input) => {
      const updated = client.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
      };
    },
    updateFromServer: (input) => {
      const updated = client.updateFromServer({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
      };
    },
    updateFromEvent: (input) => {
      const updated = client.updateFromEvent({
        ...input,
        msg: input.msg,
        model: input.model.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
      };
    },
    syncWithServer: (input) => {
      const updated = client.syncWithServer({
        ...input,
        server: input.server.c,
        client: input.client?.c,
        sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
      };
    },
    subscriptions: (input) => {
      return Sub.tag(
        tag,
        client.subscriptions({
          ...input,
          model: input.model.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model.c}
        />
      );
    },
  };
};

const tagUpdate =
  <T extends string, Model, ServerModel, Msg, ToClient, ToServer>(
    tag: T,
    update: GameClient<Model, ServerModel, Msg, ToClient, ToServer>["update"]
  ): GameClient<
    { t: T; c: Model },
    { t: T; c: ServerModel },
    { t: T; c: Msg },
    { t: T; c: ToClient },
    { t: T; c: ToServer }
  >["update"] =>
  (input) => {
    const updated = update({
      ...input,
      msg: input.msg.c,
      model: input.model.c,
      sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
    });
    return {
      model: { t: tag, c: updated.model },
      eff: Eff.t(tag, updated.eff),
      msgs: updated.msgs,
    };
  };

const tagInit =
  <T extends string, Model, ServerModel, Msg, ToClient, ToServer>(
    tag: T,
    init: GameClient<Model, ServerModel, Msg, ToClient, ToServer>["init"]
  ): GameClient<
    { t: T; c: Model },
    { t: T; c: ServerModel },
    { t: T; c: Msg },
    { t: T; c: ToClient },
    { t: T; c: ToServer }
  >["init"] =>
  (input) => {
    const initial = init({
      ...input,
      sendToServer: (m) => input.sendToServer({ t: tag, c: m }),
    });
    return {
      model: { t: tag, c: initial.model },
      eff: Eff.t(tag, initial.eff),
      msgs: initial.msgs,
    };
  };

export const GameClient = {
  tag,
  tagUpdate,
  tagInit,
};
