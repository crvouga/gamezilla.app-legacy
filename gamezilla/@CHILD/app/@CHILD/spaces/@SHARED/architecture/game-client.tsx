import {
  WithEventId,
  WithEventMeta,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { ClientCmd, ClientEvent } from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";

export type GameClientTypes = {
  //
  ClientModel: any;
  ClientMsg: any;
  //
  ToClient: any;
  ToServer: any;
  //
  GameModel: any;
  GameMsg: any;
  //
  ClientCtx: any;
};

type Output<T extends GameClientTypes> = {
  model: T["ClientModel"];
  eff?: Eff<T["ClientMsg"]>;
  msgCmd?: ClientCmd<{
    ClientMsg: T["ClientMsg"];
    ToServer: T["ToServer"];
  }>[];
  msgGame?: WithEventId<T["GameMsg"]>[];
};

export type InMsg<T extends GameClientTypes> =
  | ({ variant: "msg" } & T["ClientMsg"])
  | ({ variant: "to-client" } & T["ToClient"])
  | ({ variant: "msgEvent" } & ClientEvent);

export type OutMsg<T extends GameClientTypes> =
  | ({ variant: "msgCmd" } & ClientCmd<T>)
  | ({ variant: "game-event" } & WithEventId<T["GameMsg"]>);

export type GameClient<T extends GameClientTypes> = {
  init: (input: {
    ctx: T["ClientCtx"];
    modelGame: T["GameModel"];
    model?: T["ClientModel"] | null;
  }) => Output<T>;

  update: (input: {
    ctx: T["ClientCtx"];
    modelGame: T["GameModel"];
    modelGameBefore: T["GameModel"];
    model?: T["ClientModel"] | null;
    //
    msg?: T["ClientMsg"] | null;
    msgFromServer?: T["ToClient"] | null;
    msgEvent?: ClientEvent | null;
    msgGame?: WithEventMeta<T["GameMsg"]> | null;
  }) => Output<T>;

  subscriptions: (input: {
    intervalId: string;
    ctx: T["ClientCtx"];
    model?: T["ClientModel"] | null;
    modelGame: T["GameModel"];
  }) => Sub<T["ClientMsg"]>;

  View: (input: {
    ctx: T["ClientCtx"];
    dispatch: (msg: T["ClientMsg"]) => void;
    modelGame: T["GameModel"];
    model?: T["ClientModel"] | null;
  }) => VDom;

  ViewFeedItem: (input: {
    ctx: T["ClientCtx"];
    modelGame: T["GameModel"];
    msgEvent: T["GameMsg"];
  }) => VDom;
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
  GameModel: { t: T; c: Types["GameModel"] };
  GameMsg: { t: T; c: Types["GameMsg"] };
  ClientCtx: Types["ClientCtx"];
}> => {
  return {
    init: (input) => {
      const initial = client.init({
        ctx: input.ctx,
        modelGame: input.modelGame.c,
        model: input.model?.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.tag(tag, initial.eff),
        msgCmd: ClientCmd.tag(tag, initial.msgCmd),
      };
    },

    update: (input) => {
      const updated = client.update({
        msgEvent: input.msgEvent,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgGame: input.msgGame?.t === tag ? input.msgGame?.c : undefined,
        msgFromServer:
          input.msgFromServer?.t === tag ? input.msgFromServer?.c : undefined,
        ctx: input.ctx,
        modelGame: input.modelGame.c,
        modelGameBefore: input.modelGameBefore.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: ClientCmd.tag(tag, updated.msgCmd),
        msgGame: updated.msgGame
          ? updated.msgGame.map(
              (
                msgGame
              ): WithEventMeta<{
                t: T;
                c: WithEventMeta<Types["GameMsg"]>;
              }> => ({
                msgEventId: msgGame.msgEventId,
                happenedAt: msgGame.happenedAt,
                t: tag,
                c: {
                  ...msgGame,
                  msgEventId: msgGame.msgEventId,
                  happenedAt: msgGame.happenedAt,
                },
              })
            )
          : undefined,
      };
    },

    subscriptions: (input) => {
      return Sub.tag(
        tag,
        client.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          modelGame: input.modelGame.c,
          model: input.model?.c,
        })
      );
    },

    View: (input) => {
      return (
        <client.View
          ctx={input.ctx}
          modelGame={input.modelGame.c}
          dispatch={(m) => input.dispatch({ t: tag, c: m })}
          model={input.model?.c}
        />
      );
    },

    ViewFeedItem: (input) => {
      if (client.ViewFeedItem) {
        return client.ViewFeedItem({
          ctx: input.ctx,
          msgEvent: input.msgEvent.c,
          modelGame: input.modelGame.c,
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
 * (model) => ({ model: model + 1, msgEvent: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, msgCmd: [someCmd] }),
 * )
 * //=> { model: 3, msgEvent: [someEvent], eff: someEff, msgCmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = <T extends GameClientTypes>(
  initial: Output<T>,
  ...updaters: ((input: T["ClientModel"]) => Output<T>)[]
): Output<T> => {
  const msgCmd: ClientCmd<{
    ClientMsg: T["ClientMsg"];
    ToServer: T["ToServer"];
  }>[] = initial.msgCmd ?? [];
  const msgGames: T["GameMsg"][] = initial?.msgGame ?? [];
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
    if (updated.msgGame) {
      let j = 0;
      let len = updated.msgGame.length;
      for (j = 0; j < len; ++j) {
        msgGames.push(updated.msgGame[j]!);
      }
    }
    if (updated.msgCmd) {
      let j = 0;
      let len = updated.msgCmd.length;
      for (j = 0; j < len; ++j) {
        msgCmd.push(updated.msgCmd[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msgGame: msgGames,
    msgCmd,
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
  GameModel: { t: TTag; c: TTypes["GameModel"] };
  GameMsg: { t: TTag; c: TTypes["GameMsg"] };
  ClientCtx: TTypes["ClientCtx"];
}> => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    eff: output.eff ? Eff.tag(tag, output.eff) : undefined,
    msgCmd: output.msgCmd
      ? output.msgCmd.map((msgCmd) => ClientCmd.tagOne(tag, msgCmd))
      : undefined,
    msgGame: output.msgGame
      ? output.msgGame.map((msgGame) => ({
          msgEventId: msgGame.msgEventId,
          happenedAt: msgGame.happenedAt,
          t: tag,
          c: msgGame,
        }))
      : undefined,
  };
};

export const GameClient = {
  tag,
  tagOutput,
  chain,
};
