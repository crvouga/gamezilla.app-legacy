import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ServerEvt } from "gamezilla/app/@SHARED/server";
import { SpaceServerEvt, SpaceReqCtx, SpaceServerCtx } from "../space";
import { SpaceServerCmd } from "../space-cmd";

//
//
//
//
//
//
//

type MaybePromise<T> = Promise<T> | T;

/**
 * This is the interface for a game server.
 */
export type SpaceGameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State = null,
  Evt = null
> = {
  /**
   * This returns the initial state
   */
  init: (input: { ctx: SpaceServerCtx; state: State }) => MaybePromise<{
    model: ServerModel;
    eff?: Eff<ServerMsg>;
    evt?: ServerEvt[];
  }>;

  /**
   * This handles updates from the server
   */
  update: (input: {
    ctx: SpaceServerCtx;
    msg: ServerMsg;
    model: ServerModel;
    state: State;
  }) => MaybePromise<{
    model: ServerModel;
    eff?: Eff<ServerMsg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  /**
   * This handles updates from the client.
   */
  updateFromClient: (input: {
    ctx: SpaceReqCtx;
    msg: ToServer;
    model: ServerModel;
    state: State;
  }) => MaybePromise<{
    model: ServerModel;
    eff?: Eff<ServerMsg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  /**
   * This handles updates from the game space itself.
   */
  updateFromEvt: (input: {
    ctx: SpaceServerCtx;
    msg: SpaceServerEvt;
    model: ServerModel;
    state: State;
  }) => MaybePromise<{
    model: ServerModel;
    eff?: Eff<ServerMsg>;
    evt?: ServerEvt[];
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  /**
   *
   * @param intervalId
   * @param model
   * @returns
   */
  subscriptions: (input: {
    model: ServerModel;
    intervalId: string;
    ctx: SpaceServerCtx;
    state: State;
  }) => MaybePromise<Sub<ServerMsg>>;
};

/**
 * Tags to all the messages and models that are inputted and outputted from this module
 */
const tag = <
  T extends string,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  State,
  Evt
>(
  tag: T,
  server: SpaceGameServer<
    ServerModel,
    ServerMsg,
    ToClient,
    ToServer,
    State,
    Evt
  >
): SpaceGameServer<
  { t: T; c: ServerModel },
  { t: T; c: ServerMsg },
  { t: T; c: ToClient },
  { t: T; c: ToServer },
  { t: T; c: State },
  { t: T; c: Evt }
> => {
  return {
    init: async (input) => {
      const initial = await server.init({
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        evt: initial.evt,
      };
    },
    update: async (input) => {
      const updated = await server.update({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromClient: async (input) => {
      const updated = await server.updateFromClient({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg.c,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromEvt: async (input) => {
      const updated = await server.updateFromEvt({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        evt: updated.evt,
      };
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await server.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          model: input.model.c,
          state: input.state.c,
        })
      );
    },
  };
};

export const SpaceGameServer = {
  tag,
};
