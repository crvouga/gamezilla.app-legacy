import { Eff, Sub } from "gamezilla/@SHARED/core";
import { SpaceReqCtx, SpaceServerCtx, SpaceServerEvt } from "../space";
import { SpaceServerCmd } from "../space-cmd";

//
//
//
//
//
//
//

type MaybePromise<T> = Promise<T> | T;

export type GameServer<
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  GameState = null,
  GameEvent = null
> = {
  init: (input: { ctx: SpaceServerCtx; state: GameState }) => MaybePromise<{
    model: ServerModel;
    eff?: Eff<ServerMsg>;
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  update: (input: {
    ctx: SpaceServerCtx;
    msg: ServerMsg;
    model: ServerModel;
    state: GameState;
  }) => MaybePromise<{
    model: ServerModel;
    events?: GameEvent[];
    eff?: Eff<ServerMsg>;
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  updateFromClient: (input: {
    ctx: SpaceReqCtx;
    msg: ToServer;
    model: ServerModel;
    state: GameState;
  }) => MaybePromise<{
    model: ServerModel;
    events?: GameEvent[];
    eff?: Eff<ServerMsg>;
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  updateFromEvent: (input: {
    ctx: SpaceServerCtx;
    msg: SpaceServerEvt;
    model: ServerModel;
    state: GameState;
  }) => MaybePromise<{
    model: ServerModel;
    events?: GameEvent[];
    eff?: Eff<ServerMsg>;
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  updateFromGame: (input: {
    ctx: SpaceServerCtx;
    msg: GameEvent;
    model: ServerModel;
    prev: GameState | null;
    next: GameState;
  }) => MaybePromise<{
    model: ServerModel;
    events?: GameEvent[];
    eff?: Eff<ServerMsg>;
    cmd?: SpaceServerCmd<ToClient>[];
  }>;

  subscriptions: (input: {
    model: ServerModel;
    intervalId: string;
    ctx: SpaceServerCtx;
    state: GameState;
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
  server: GameServer<ServerModel, ServerMsg, ToClient, ToServer, State, Evt>
): GameServer<
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
        cmd: SpaceServerCmd.tag(tag, initial.cmd),
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
        events: updated.events?.map((event) => ({ t: tag, c: event })),
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
        events: updated.events?.map((event) => ({ t: tag, c: event })),
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromGame: async (input) => {
      const updated = await server.updateFromGame({
        ctx: input.ctx,
        prev: input.prev?.c ?? null,
        next: input.next.c,
        msg: input.msg.c,
        model: input.model?.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
      };
    },
    updateFromEvent: async (input) => {
      const updated = await server.updateFromEvent({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        events: updated.events?.map((event) => ({ t: tag, c: event })),
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

export const GameServer = {
  tag,
};
