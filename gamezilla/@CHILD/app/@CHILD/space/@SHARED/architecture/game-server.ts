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

export type GameServerTypes = {
  ServerModel: any;
  ServerMsg: any;
  ToClient: any;
  ToServer: any;
  GameState: any;
  GameEvent: any;
};

export type GameServer<T extends GameServerTypes> = {
  init: (input: { ctx: SpaceServerCtx; state: T["GameState"] }) => Promise<{
    model: T["ServerModel"];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  update: (input: {
    ctx: SpaceServerCtx;
    msg: T["ServerMsg"];
    model: T["ServerModel"];
    state: T["GameState"];
  }) => Promise<{
    model: T["ServerModel"];
    events?: T["GameEvent"][];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  updateFromClient: (input: {
    ctx: SpaceReqCtx;
    msg: T["ToServer"];
    model: T["ServerModel"];
    state: T["GameState"];
  }) => Promise<{
    model: T["ServerModel"];
    events?: T["GameEvent"][];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  updateFromEvent: (input: {
    ctx: SpaceServerCtx;
    msg: SpaceServerEvt;
    model: T["ServerModel"];
    state: T["GameState"];
  }) => Promise<{
    model: T["ServerModel"];
    events?: T["GameEvent"][];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  updateFromGame: (input: {
    ctx: SpaceServerCtx;
    msg: T["GameEvent"];
    model: T["ServerModel"];
    prev: T["GameState"] | null;
    next: T["GameState"];
  }) => Promise<{
    model: T["ServerModel"];
    events?: T["GameEvent"][];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  subscriptions: (input: {
    model: T["ServerModel"];
    intervalId: string;
    ctx: SpaceServerCtx;
    state: T["GameState"];
  }) => Promise<Sub<T["ServerMsg"]>>;
};

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
const tag = <T extends string, Types extends GameServerTypes>(
  tag: T,
  server: GameServer<Types>
): GameServer<{
  ServerModel: { t: T; c: Types["ServerModel"] };
  ServerMsg: { t: T; c: Types["ServerMsg"] };
  ToClient: { t: T; c: Types["ToClient"] };
  ToServer: { t: T; c: Types["ToServer"] };
  GameState: { t: T; c: Types["GameState"] };
  GameEvent: { t: T; c: Types["GameEvent"] };
}> => {
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
