import { Eff, Sub } from "gamezilla/@SHARED/core";
import { SpaceReqCtx, SpaceServerCtx, SpaceServerEvent } from "../space";
import { SpaceServerCmd } from "../space-server-cmd";
import {
  EventMeta,
  WithEventId,
  WithEventMeta,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";

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
  MsgToClient: any;
  MsgToServer: any;
  //
  ModelGame: any;
  MsgGame: any;
  //
};

type Output<T extends GameServerTypes> = {
  model: T["ServerModel"];
  msgGame?: WithEventId<T["MsgGame"]>[];
  eff?: Eff<T["ServerMsg"]>;
  msgCmd?: SpaceServerCmd<T["MsgToClient"]>[];
};

export type GameServer<T extends GameServerTypes> = {
  init: (input: {
    ctx: SpaceServerCtx;
    state: T["ModelGame"];
    model?: T["ServerModel"] | null;
  }) => Promise<{
    model: T["ServerModel"];
    eff?: Eff<T["ServerMsg"]>;
    msgCmd?: SpaceServerCmd<T["MsgToClient"]>[];
  }>;

  update: (input: {
    ctx: SpaceServerCtx | SpaceReqCtx;
    state: T["ModelGame"];
    model?: T["ServerModel"] | null;
    //
    msg?: T["ServerMsg"] | null;
    clientMsg?: T["MsgToServer"] | null;
    msgGame?: WithEventMeta<T["MsgGame"]> | null;
    msgEvt?: SpaceServerEvent | null;
  }) => Promise<Output<T>>;

  subscriptions: (input: {
    model?: T["ServerModel"] | null;
    intervalId: string;
    ctx: SpaceServerCtx;
    state: T["ModelGame"];
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
  MsgToClient: { t: T; c: Types["MsgToClient"] };
  MsgToServer: { t: T; c: Types["MsgToServer"] };
  ModelGame: { t: T; c: Types["ModelGame"] };
  MsgGame: { t: T; c: Types["MsgGame"] & EventMeta };
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
        msgCmd: SpaceServerCmd.tag(tag, initial.msgCmd),
      };
    },

    update: async (input) => {
      const updated = await server.update({
        msgEvt: input.msgEvt,
        msg: input.msg?.t === tag ? input.msg?.c : undefined,
        model: input.model?.t === tag ? input.model?.c : undefined,
        msgGame: input.msgGame?.t === tag ? input.msgGame?.c : undefined,
        clientMsg: input.clientMsg?.t === tag ? input.clientMsg?.c : undefined,
        ctx: input.ctx,
        state: input.state.c,
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.tag(tag, updated.eff),
        msgCmd: SpaceServerCmd.tag(tag, updated.msgCmd),
        msgGame: updated.msgGame
          ? updated.msgGame.map(
              (msgGame): EventMeta & { t: T; c: Types["MsgGame"] } => ({
                eventId: msgGame.msgEvtId,
                happenedAt: msgGame.happenedAt,
                t: tag,
                c: msgGame,
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
 * (model) => ({ model: model + 1, msgEvt: [someEvent] }),
 * (model) => ({ model: model + 1, eff: someEff }),
 * (model) => ({ model: model + 1, msgCmd: [someCmd] }),
 * )
 * //=> { model: 3, msgEvt: [someEvent], eff: someEff, msgCmd: [someCmd] }
 *
 * @param initial - the model to start with
 * @param updaters - a list of update functions to apply to the model
 * @returns Accumulated output from all the update functions
 */
const chain = async <T extends GameServerTypes>(
  initial: Output<T> | Promise<Output<T>>,
  ...updaters: ((input: T["ServerModel"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const msgCmd: SpaceServerCmd<T["MsgToClient"]>[] =
    (await initial).msgCmd ?? [];
  const msgGames: (T["MsgGame"] & EventMeta)[] = (await initial)?.msgGame ?? [];
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

export const GameServer = {
  tag,
  chain,
};
