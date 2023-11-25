import { ClientCmd, ClientEvt } from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ActivityFeedItem } from "../activity-feed";

export type GameClientTypes = {
  //
  ClientModel: any;
  ClientMsg: any;
  //
  ToClient: any;
  ToServer: any;
  //
  GameState: any;
  GameEvent: any;
  //
  ViewCtx: any;
  ClientCtx: any;
};

type Output<T extends GameClientTypes> = {
  model: T["ClientModel"];
  eff?: Eff<T["ClientMsg"]>;
  cmd?: ClientCmd<{
    ClientMsg: T["ClientMsg"];
    ToServer: T["ToServer"];
  }>[];
  gameEvent?: T["GameEvent"][];
};

export type GameClient<T extends GameClientTypes> = {
  init: (input: {
    ctx: T["ClientCtx"];
    state: T["GameState"];
    model?: T["ClientModel"] | null;
  }) => Output<T>;

  update: (input: {
    ctx: T["ClientCtx"];
    state: T["GameState"];
    model?: T["ClientModel"] | null;
    //
    msg?: T["ClientMsg"] | null;
    serverMsg?: T["ToClient"] | null;
    evt?: ClientEvt | null;
    gameEvent?: T["GameEvent"] | null;
  }) => Output<T>;

  subscriptions: (input: {
    intervalId: string;
    ctx: T["ClientCtx"];
    model?: T["ClientModel"];
    state: T["GameState"];
  }) => Sub<T["ClientMsg"]>;

  View: (input: {
    ctx: T["ViewCtx"];
    dispatch: (msg: T["ClientMsg"]) => void;
    state: T["GameState"];
    model?: T["ClientModel"] | null;
  }) => VDom;

  viewEvent?: (input: {
    ctx: T["ClientCtx"];
    event: T["GameEvent"];
  }) => ActivityFeedItem | null;
};

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
export const tag = <T extends string, Types extends GameClientTypes>(
  tag: T,
  client: GameClient<Types>
): GameClient<{
  ClientModel: { t: T; c: Types["ClientModel"] };
  ClientMsg: { t: T; c: Types["ClientMsg"] };
  ToClient: { t: T; c: Types["ToClient"] };
  ToServer: { t: T; c: Types["ToServer"] };
  GameState: { t: T; c: Types["GameState"] };
  GameEvent: { t: T; c: Types["GameEvent"] };
  ViewCtx: Types["ViewCtx"];
  ClientCtx: Types["ClientCtx"];
}> => {
  return {
    init: (input) => {
      const initial = client.init({
        ctx: input.ctx,
        state: input.state.c,
        model: input.model?.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        cmd: ClientCmd.tag(tag, initial.cmd),
      };
    },

    update: (input) => {
      const updated = client.update({
        evt: input.evt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        gameEvent: input.gameEvent?.t === tag ? input.gameEvent?.c : undefined,
        serverMsg: input.serverMsg?.t === tag ? input.serverMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        cmd: ClientCmd.tag(tag, updated.cmd),
        gameEvent: updated.gameEvent
          ? updated.gameEvent.map((gameEvent) => ({
              t: tag,
              c: gameEvent,
            }))
          : undefined,
      };
    },

    subscriptions: (input) => {
      return Sub.tag(
        tag,
        client.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          state: input.state.c,
          model: input.model?.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          state={input.state.c}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model?.c}
        />
      );
    },

    viewEvent: (input) => {
      if (client.viewEvent) {
        return client.viewEvent({
          ctx: input.ctx,
          event: input.event.c,
        });
      }
      return null;
    },
  };
};

/**
 * @description
 * A helper function used for chaining together update functions together.
 * @example
 * const updated = chain(
 * { model: 0 },
 * (model) => ({ model: model + 1, evt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, cmd: [someCmd] }),
 * )
 * //=> { model: 3, evt: [someEvt], eff: someEff, cmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = <T extends GameClientTypes>(
  initial: Output<T>,
  ...updaters: ((input: T["ClientModel"]) => Output<T>)[]
): Output<T> => {
  const cmd: ClientCmd<{
    ClientMsg: T["ClientMsg"];
    ToServer: T["ToServer"];
  }>[] = initial.cmd ?? [];
  const gameEvents: T["GameEvent"][] = initial?.gameEvent ?? [];
  const eff: Eff<T["ClientMsg"]>[] = initial.eff ? [initial.eff] : [];

  let model = initial.model;
  let i = 0;
  let len = updaters.length;

  for (i = 0; i < len; ++i) {
    const updated = updaters[i]!(model);

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

const tagOutput = <TTag extends string, TTypes extends GameClientTypes>(
  tag: TTag,
  output: Output<TTypes>
): Output<{
  ClientModel: { t: TTag; c: TTypes["ClientModel"] };
  ClientMsg: { t: TTag; c: TTypes["ClientMsg"] };
  ToClient: { t: TTag; c: TTypes["ToClient"] };
  ToServer: { t: TTag; c: TTypes["ToServer"] };
  GameState: { t: TTag; c: TTypes["GameState"] };
  GameEvent: { t: TTag; c: TTypes["GameEvent"] };
  ViewCtx: TTypes["ViewCtx"];
  ClientCtx: TTypes["ClientCtx"];
}> => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    eff: output.eff ? Eff.t(tag, output.eff) : undefined,
    cmd: output.cmd
      ? output.cmd.map((cmd) => ClientCmd.tagOne(tag, cmd))
      : undefined,
    gameEvent: output.gameEvent
      ? output.gameEvent.map((gameEvent) => ({ t: tag, c: gameEvent }))
      : undefined,
  };
};

export const GameClient = {
  tag,
  tagOutput,
  chain,
};
