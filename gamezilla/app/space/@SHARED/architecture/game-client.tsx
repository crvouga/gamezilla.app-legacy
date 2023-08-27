import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientAppMsg, ClientCmd } from "gamezilla/app/@SHARED/client";
import { VDom } from "gamezilla/app/@SHARED/ui";
import { SpaceClientCtx, SpaceEvt, SpaceViewCtx } from "../space";

/**
 * Represents all the functions needed to run a game client side
 */
export type SpaceGameClient<
  Model,
  ServerModel,
  Msg,
  ToClient,
  ToServer,
  ViewCtx = SpaceViewCtx,
  Ctx = SpaceClientCtx
> = {
  init: (input: { ctx: Ctx }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
    cmd?: ClientCmd<ToServer>[];
  };

  update: (input: { ctx: Ctx; msg: Msg; model: Model }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
    cmd?: ClientCmd<ToServer>[];
  };

  updateFromServer: (input: { ctx: Ctx; msg: ToClient; model: Model }) => {
    model: Model;
    eff?: Eff<Msg>;
    msgs?: ClientAppMsg[];
    cmd?: ClientCmd<ToServer>[];
  };

  /**
   * Handles messages from the game space like users leaving and joining
   */
  updateFromEvent: (input: {
    ctx: SpaceViewCtx;
    msg: SpaceEvt;
    model: Model;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    cmd?: ClientCmd<ToServer>[];
    msgs?: ClientAppMsg[];
  };

  syncWithServer: (input: {
    ctx: Ctx;
    server: ServerModel;
    client?: Model | null;
  }) => {
    model: Model;
    eff?: Eff<Msg>;
    cmd?: ClientCmd<ToServer>[];
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
  client: SpaceGameClient<Model, ServerModel, Msg, ToClient, ToServer, ViewCtx>
): SpaceGameClient<
  { t: T; c: Model },
  { t: T; c: ServerModel },
  { t: T; c: Msg },
  { t: T; c: ToClient },
  { t: T; c: ToServer },
  ViewCtx
> => {
  return {
    init: (input) => {
      const initial = client.init(input);
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        msgs: initial.msgs,
        cmd: ClientCmd.tag(tag, initial.cmd),
      };
    },
    update: (input) => {
      const updated = client.update({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },
    updateFromServer: (input) => {
      const updated = client.updateFromServer({
        ...input,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },
    updateFromEvent: (input) => {
      const updated = client.updateFromEvent({
        ...input,
        msg: input.msg,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },
    syncWithServer: (input) => {
      const updated = client.syncWithServer({
        ...input,
        server: input.server.c,
        client: input.client?.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msgs: updated.msgs,
        cmd: ClientCmd.tag(tag, updated.cmd),
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
    update: SpaceGameClient<
      Model,
      ServerModel,
      Msg,
      ToClient,
      ToServer
    >["update"]
  ): SpaceGameClient<
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
    });
    return {
      model: { t: tag, c: updated.model },
      eff: Eff.t(tag, updated.eff),
      msgs: updated.msgs,
      cmd: ClientCmd.tag(tag, updated.cmd),
    };
  };

const tagInit =
  <T extends string, Model, ServerModel, Msg, ToClient, ToServer>(
    tag: T,
    init: SpaceGameClient<Model, ServerModel, Msg, ToClient, ToServer>["init"]
  ): SpaceGameClient<
    { t: T; c: Model },
    { t: T; c: ServerModel },
    { t: T; c: Msg },
    { t: T; c: ToClient },
    { t: T; c: ToServer }
  >["init"] =>
  (input) => {
    const initial = init(input);
    return {
      model: { t: tag, c: initial.model },
      eff: Eff.t(tag, initial.eff),
      msgs: initial.msgs,
      cmd: ClientCmd.tag(tag, initial.cmd),
    };
  };

export const SpaceGameClient = {
  tag,
  tagUpdate,
  tagInit,
};
