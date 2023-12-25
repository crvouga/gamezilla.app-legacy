import { Eff, Sub } from "gamezilla/@SHARED/core";
import { SpaceReqCtx, SpaceServerCtx, SpaceServerEvent } from "../space";
import { SpaceServerCmd } from "../space-server-cmd";
import {
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/event";

//
//
//
//
//
//
//

export type GameServerTypes = {
  //
  ServerModel: any;
  ServerMsg: any;
  ToClient: any;
  ToServer: any;
  //
  GameState: any;
  GameEvent: any;
  //
};

type Output<T extends GameServerTypes> = {
  model: T["ServerModel"];
  gameEvent?: WithEventId<T["GameEvent"]>[];
  eff?: Eff<T["ServerMsg"]>;
  cmd?: SpaceServerCmd<T["ToClient"]>[];
};

export type GameServer<T extends GameServerTypes> = {
  init: (input: {
    ctx: SpaceServerCtx;
    state: T["GameState"];
    model?: T["ServerModel"] | null;
  }) => Promise<{
    model: T["ServerModel"];
    eff?: Eff<T["ServerMsg"]>;
    cmd?: SpaceServerCmd<T["ToClient"]>[];
  }>;

  update: (input: {
    ctx: SpaceServerCtx | SpaceReqCtx;
    state: T["GameState"];
    model?: T["ServerModel"] | null;
    //
    msg?: T["ServerMsg"] | null;
    clientMsg?: T["ToServer"] | null;
    gameEvent?: WithEventMeta<T["GameEvent"]> | null;
    event?: SpaceServerEvent | null;
  }) => Promise<Output<T>>;

  subscriptions: (input: {
    model?: T["ServerModel"] | null;
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
  GameEvent: { t: T; c: Types["GameEvent"] & EventMeta };
}> => {
  return {
    init: async (input) => {
      const initial = await server.init({
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.tag(tag, initial.eff),
        cmd: SpaceServerCmd.tag(tag, initial.cmd),
      };
    },

    update: async (input) => {
      const updated = await server.update({
        event: input.event,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        gameEvent: input.gameEvent?.t === tag ? input.gameEvent?.c : undefined,
        clientMsg: input.clientMsg?.t === tag ? input.clientMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.tag(tag, updated.eff),
        cmd: SpaceServerCmd.tag(tag, updated.cmd),
        gameEvent: updated.gameEvent
          ? updated.gameEvent.map(
              (gameEvent): EventMeta & { t: T; c: Types["GameEvent"] } => ({
                eventId: gameEvent.eventId,
                happenedAt: gameEvent.happenedAt,
                t: tag,
                c: gameEvent,
              })
            )
          : undefined,
      };
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await server.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          model: input.model?.c,
          state: input.state.c,
        })
      );
    },
  };
};

/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, event: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, event: [someEvent], eff: someEff, cmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = async <T extends GameServerTypes>(
  initial: Output<T> | Promise<Output<T>>,
  ...updaters: ((input: T["ServerModel"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const cmd: SpaceServerCmd<T["ToClient"]>[] = (await initial).cmd ?? [];
  const gameEvents: (T["GameEvent"] & EventMeta)[] =
    (await initial)?.gameEvent ?? [];
  const eff: Eff<T["ServerMsg"]>[] = (await initial).eff
    ? [(await initial).eff!]
    : [];

  let model = (await initial).model;
  let i = 0;
  let len = updaters.length;

  for (i = 0; i < len; ++i) {
    const updated = await updaters[i]!(model);

    model = updated.model;

    if (updated.eff) {
      eff.push(updated.eff);
    }
    if (updated.gameEvent) {
      let j = 0;
      let len = updated.gameEvent.length;
      for (j = 0; j < len; ++j) {
        gameEvents.push(updated.gameEvent[j]!);
      }
    }
    if (updated.cmd) {
      let j = 0;
      let len = updated.cmd.length;
      for (j = 0; j < len; ++j) {
        cmd.push(updated.cmd[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    gameEvent: gameEvents,
    cmd,
  };
};

export const GameServer = {
  tag,
  chain,
};
