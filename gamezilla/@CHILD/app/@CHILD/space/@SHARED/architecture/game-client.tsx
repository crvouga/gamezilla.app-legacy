import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { SpaceClientCtx, SpaceClientEvt, SpaceViewCtx } from "../space";
import { ActivityFeedItem } from "../activity-feed";

export type GameClientTypes = {
  //
  ClientModel: any;
  ClientMsg: any;
  //
  ToClient: any;
  ToServer: any;
  //
  ClientEvt: any;
  ClientCmd: any;
  //
  GameState: any;
  GameEvent: any;
  //
  ViewCtx: any;
  ClientCtx: any;
};

export type GameClient<T extends GameClientTypes> = {
  init: (input: { ctx: T["ClientCtx"]; state: T["GameState"] }) => {
    model: T["ClientModel"];
    eff?: Eff<T["ClientMsg"]>;
    cmd?: ClientCmd<T["ToServer"]>[];
  };

  update: (input: {
    ctx: T["ClientCtx"];
    msg: T["ClientMsg"];
    model: T["ClientModel"];
    state: T["GameState"];
  }) => {
    model: T["ClientModel"];
    eff?: Eff<T["ClientMsg"]>;
    cmd?: ClientCmd<T["ToServer"]>[];
    gameEvent?: T["GameEvent"];
  };

  updateFromServer: (input: {
    ctx: T["ClientCtx"];
    msg: T["ToClient"];
    model: T["ClientModel"];
    state: T["GameState"];
  }) => {
    model: T["ClientModel"];
    eff?: Eff<T["ClientMsg"]>;
    cmd?: ClientCmd<T["ToServer"]>[];
    gameEvent?: T["GameEvent"];
  };

  updateFromEvent: (input: {
    ctx: T["ClientCtx"];
    msg: SpaceClientEvt;
    model: T["ClientModel"];
    state: T["GameState"];
  }) => {
    model: T["ClientModel"];
    eff?: Eff<T["ClientMsg"]>;
    cmd?: ClientCmd<T["ToServer"]>[];
    gameEvent?: T["GameEvent"];
  };

  updateFromGame: (input: {
    ctx: T["ClientCtx"];
    msg: T["GameEvent"];
    model: T["ClientModel"];
    state: T["GameState"];
  }) => {
    model: T["ClientModel"];
    eff?: Eff<T["ClientMsg"]>;
    cmd?: ClientCmd<T["ToServer"]>[];
    gameEvent?: T["GameEvent"];
  };

  subscriptions: (input: {
    intervalId: string;
    ctx: T["ClientCtx"];
    model: T["ClientModel"];
    state: T["GameState"];
  }) => Sub<T["ClientMsg"]>;

  View: (input: {
    ctx: T["ViewCtx"];
    dispatch: (msg: T["ClientMsg"]) => void;
    state: T["GameState"];
    model: T["ClientModel"];
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
  //
  ClientCmd: Types["ClientCmd"];
  ClientEvt: Types["ClientEvt"];
}> => {
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
        gameEvent: updated.gameEvent
          ? { t: tag, c: updated.gameEvent }
          : undefined,
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
        gameEvent: updated.gameEvent
          ? { t: tag, c: updated.gameEvent }
          : undefined,
      };
    },

    updateFromEvent: (input) => {
      const updated = client.updateFromEvent({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg,
        model: input.model.c,
      });

      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        cmd: ClientCmd.tag(tag, updated.cmd),
        gameEvent: updated.gameEvent
          ? { t: tag, c: updated.gameEvent }
          : undefined,
      };
    },

    updateFromGame: (input) => {
      const updated = client.updateFromGame({
        ctx: input.ctx,
        state: input.state.c,
        msg: input.msg.c,
        model: input.model?.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        cmd: ClientCmd.tag(tag, updated.cmd),
        gameEvent: updated.gameEvent
          ? { t: tag, c: updated.gameEvent }
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
          model: input.model.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          state={input.state.c}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model.c}
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

export const GameClient = {
  tag,
};
