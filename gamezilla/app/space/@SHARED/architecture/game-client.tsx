import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCmd } from "gamezilla/app/@SHARED/client";
import { VDom } from "gamezilla/app/@SHARED/ui";
import { SpaceClientCtx, SpaceClientEvt, SpaceViewCtx } from "../space";

/**
 * Represents all the functions needed to run a game client side
 */
export type SpaceGameClient<
  ClientModel,
  ClientMsg,
  ToClient,
  ToServer,
  GameState = null,
  GameEvt = null,
  ViewCtx = SpaceViewCtx,
  ClientCtx = SpaceClientCtx
> = {
  init: (input: { ctx: ClientCtx; state: GameState }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
  };

  update: (input: {
    ctx: ClientCtx;
    msg: ClientMsg;
    model: ClientModel;
    state: GameState;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
  };

  updateFromServer: (input: {
    ctx: ClientCtx;
    msg: ToClient;
    model: ClientModel;
    state: GameState;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
  };

  updateFromEvt: (input: {
    ctx: SpaceClientCtx;
    msg: SpaceClientEvt;
    model: ClientModel;
    state: GameState;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
  };

  updateFromGameEvt: (input: {
    ctx: SpaceClientCtx;
    msg: GameEvt;
    model?: ClientModel;
    state: GameState;
  }) => {
    model: ClientModel;
    eff?: Eff<ClientMsg>;
    cmd?: ClientCmd<ToServer>[];
  };

  subscriptions: (input: {
    intervalId: string;
    ctx: ClientCtx;
    model: ClientModel;
    state: GameState;
  }) => Sub<ClientMsg>;

  View: (input: {
    ctx: ViewCtx;
    dispatch: (msg: ClientMsg) => void;
    state: GameState;
    dispatchEvent: (evt: GameEvt) => void;
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
        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },

    updateFromEvt: (input) => {
      const updated = client.updateFromEvt({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),

        cmd: ClientCmd.tag(tag, updated.cmd),
      };
    },

    updateFromGameEvt: (input) => {
      const updated = client.updateFromGameEvt({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg.c,
        model: input.model?.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
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
