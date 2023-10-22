import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientEvt, ClientCmd } from "gamezilla/app/@SHARED/client";
import { VDom } from "gamezilla/app/@SHARED/ui";
import { SpaceClientCtx, SpaceEvt, SpaceViewCtx } from "../space";

/**
 * Represents all the functions needed to run a game client side
 */
export type SpaceGameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State = null,
  Evt = null,
  ViewCtx = SpaceViewCtx,
  ClientCtx = SpaceClientCtx
> = {
  init: (input: { ctx: ClientCtx; state: State }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    evt?: Evt[];
    cmd?: ClientCmd<ToServer>[];
  };

  update: (input: {
    ctx: ClientCtx;
    msg: ClientMsg;
    model: ClientModel;
    state: State;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    evt?: Evt[];
    cmd?: ClientCmd<ToServer>[];
  };

  updateFromServer: (input: {
    ctx: ClientCtx;
    msg: ToClient;
    model: ClientModel;
    state: State;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    evt?: Evt[];
    cmd?: ClientCmd<ToServer>[];
  };

  /**
   * Handles messages from the game space like users leaving and joining
   */
  updateFromEvt: (input: {
    ctx: SpaceClientCtx;
    msg: Evt;
    model: ClientModel;
    state: State;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
    evt?: Evt[];
  };

  subscriptions: (input: {
    intervalId: string;
    ctx: ClientCtx;
    model: ClientModel;
    state: State;
  }) => Sub<ClientMsg>;

  View: (input: {
    ctx: ViewCtx;
    dispatch: (msg: ClientMsg) => void;
    state: State;
    dispatchEvent: (evt: Evt) => void;
    model: ClientModel;
  }) => VDom;
};

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <
  T extends string,
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  State,
  Evt,
  ViewCtx
>(
  tag: T,
  client: SpaceGameClient<
    ClientModel,
    ClientMsg,
    ToClient,
    ToServer,
    State,
    Evt,
    ViewCtx
  >
): SpaceGameClient<
  { t: T; c: ClientModel },
  { t: T; c: ClientMsg },
  { t: T; c: ToClient },
  { t: T; c: ToServer },
  { t: T; c: State },
  { t: T; c: Evt },
  ViewCtx
> => {
  return {
    init: (input) => {
      const initial = client.init({
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        evt: initial.evt?.map((evt) => ({ t: tag, c: evt })),
        cmd: ClientCmd.tag(tag, initial.cmd),
      };
    },

    update: (input) => {
      const updated = client.update({
        msg: input.msg.c,
        model: input.model.c,
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt?.map((evt) => ({ t: tag, c: evt })),
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },

    updateFromServer: (input) => {
      const updated = client.updateFromServer({
        msg: input.msg.c,
        model: input.model.c,
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt?.map((evt) => ({ t: tag, c: evt })),
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },

    updateFromEvt: (input) => {
      const updated = client.updateFromEvt({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt?.map((evt) => ({ t: tag, c: evt })),
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },

    subscriptions: (input) => {
      return Sub.tag(
        tag,
        client.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          state: input.state.c,
          model: input.model.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          state={input.state.c}
          dispatchEvent={(m) => input.dispatchEvent({ t: tag, c: m })}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model.c}
        />
      );
    },
  };
};

export const SpaceGameClient = {
  tag,
};
