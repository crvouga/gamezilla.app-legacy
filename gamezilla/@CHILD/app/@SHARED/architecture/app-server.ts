import { Eff, Sub } from "gamezilla/@SHARED/core";
import { ReqCtx, ServerCmd, ServerCtx, ServerEvt } from "../server";

//
//
//
//
//
//
//

export type ServerTypes = {
  ServerModel: any;
  ServerMsg: any;
  ToClient: any;
  ToServer: any;
};

type Output<T extends ServerTypes> = {
  model: T["ServerModel"];
  eff?: Eff<T["ServerMsg"]>;
  msg?: OutMsg<T>[];
};

type OutMsg<T extends ServerTypes> =
  | (ServerEvt & { variant: "evt" })
  | (ServerCmd<T["ToClient"]> & { variant: "cmd" });

function tagOutMsg<TTag extends string, T extends ServerTypes>(
  tag: TTag,
  msg: OutMsg<T>
): OutMsg<{
  ServerModel: T["ServerModel"];
  ServerMsg: T["ServerMsg"];
  ToClient: { t: TTag; c: T["ToClient"] };
  ToServer: T["ToServer"];
}> {
  switch (msg.variant) {
    case "cmd": {
      const tagged = ServerCmd.tag(tag, [msg]);
      const taggedOne = tagged![0]!;
      return { ...taggedOne, variant: "cmd" };
    }

    case "evt": {
      return msg;
    }
  }
}

type InMsg<T extends ServerTypes> =
  | (T["ServerMsg"] & { variant: "msg" })
  | (T["ToServer"] & { variant: "from-client" })
  | (ServerCmd<T["ToClient"]> & { variant: "cmd" })
  | (ServerEvt & { variant: "evt" });

export type GameServer<T extends ServerTypes> = {
  init: (input: { ctx: ServerCtx; model: T["ServerModel"] }) => Promise<{
    model: T["ServerModel"];
    eff?: Eff<T["ServerMsg"]>;
    msg?: OutMsg<T>[];
  }>;

  update: (input: {
    ctx: ServerCtx | ReqCtx;
    model: T["ServerModel"];
    msg: InMsg<T>;
  }) => Promise<Output<T>>;

  subscriptions: (input: {
    model: T["ServerModel"];
    intervalId: string;
    ctx: ServerCtx;
  }) => Promise<Sub<T["ServerMsg"]>>;
};

/**
 * Tags all the messages and models that are inputted and outputted from this module.
 */
const tag = <T extends string, Types extends ServerTypes>(
  tag: T,
  server: GameServer<Types>
): GameServer<{
  ServerModel: { t: T; c: Types["ServerModel"] };
  ServerMsg: { t: T; c: Types["ServerMsg"] };
  ToClient: { t: T; c: Types["ToClient"] };
  ToServer: { t: T; c: Types["ToServer"] };
}> => {
  return {
    init: async (input) => {
      const initial = await server.init({
        ctx: input.ctx,
        model: input.model.c,
      });
      return {
        model: { t: tag, c: initial.model },
        eff: Eff.t(tag, initial.eff),
        msg: initial.msg?.map((msg) => tagOutMsg(tag, msg)),
      };
    },
    update: async (input) => {
      const updated = await server.update({
        ctx: input.ctx,
        model: input.model.c,
        msg:
          input.msg.variant === "evt" || input.msg.variant === "cmd"
            ? input.msg
            : { ...input.msg.c, variant: input.msg.variant },
      });
      return {
        model: { t: tag, c: updated.model },
        eff: Eff.t(tag, updated.eff),
        msg: updated.msg?.map((msg) => tagOutMsg(tag, msg)),
      };
    },
    subscriptions: async (input) => {
      return Sub.tag(
        tag,
        await server.subscriptions({
          ctx: input.ctx,
          intervalId: input.intervalId,
          model: input.model.c,
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
const chain = async <T extends ServerTypes>(
  initial: Output<T> | Promise<Output<T>>,
  ...updaters: ((input: T["ServerModel"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const outMsg: OutMsg<T>[] = (await initial).msg ?? [];
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

    if (updated.msg) {
      let j = 0;
      let len = updated.msg.length;
      for (j = 0; j < len; ++j) {
        outMsg.push(updated.msg[j]!);
      }
    }
  }

  return {
    model,
    eff: Eff.batch(eff),
    msg: outMsg,
  };
};

export const GameServer = {
  tag,
  chain,
};
