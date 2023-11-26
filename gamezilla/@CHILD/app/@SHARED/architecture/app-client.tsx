import { ClientCmd, ClientEvt } from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";

export type AppClientTypes = {
  //
  ClientModel: any;
  ClientMsg: any;
  //
  ToClient: any;
  ToServer: any;
  //
  ViewCtx: any;
  ClientCtx: any;
  //
  Cmd: any;
};

type Output<T extends AppClientTypes> = {
  model: T["ClientModel"];
  eff?: Eff<T["ClientMsg"]>;
  msg?: OutMsg<T>[];
};

export type InMsg<T extends AppClientTypes> =
  | ({ variant: "msg" } & T["ClientMsg"])
  | ({ variant: "from-server" } & T["ToClient"])
  | ({ variant: "evt" } & ClientEvt)
  | ({ variant: "cmd" } & T["Cmd"]);

export type OutMsg<T extends AppClientTypes> =
  | ({ variant: "cmd" } & ClientCmd<T>)
  | ({ variant: "evt" } & ClientEvt);

export type AppClient<T extends AppClientTypes> = {
  init: (input: {
    ctx: T["ClientCtx"];
    stored: T["ClientModel"] | null;
  }) => Output<T>;

  update: (input: {
    ctx: T["ClientCtx"];
    model: T["ClientModel"];
    msg: InMsg<T>;
  }) => Output<T>;

  subscriptions: (input: {
    intervalId: string;
    ctx: T["ClientCtx"];
    model: T["ClientModel"];
  }) => Sub<T["ClientMsg"]>;

  View: (input: {
    ctx: T["ViewCtx"];
    dispatch: (msg: T["ClientMsg"]) => void;
    model: T["ClientModel"];
  }) => VDom;
};

function tagOutMsg<TTag extends string, T extends AppClientTypes>(
  tag: TTag,
  msg: OutMsg<T>
): OutMsg<{
  ClientCtx: T["ClientCtx"];
  ClientModel: T["ClientModel"];
  ClientMsg: { t: TTag; c: T["ClientMsg"] };
  ToClient: { t: TTag; c: T["ToClient"] };
  ToServer: { t: TTag; c: T["ToServer"] };
  ViewCtx: T["ViewCtx"];
  Cmd: T["Cmd"];
}> {
  switch (msg.variant) {
    case "cmd": {
      const taggedCmd = ClientCmd.tag(tag, [msg]);

      return {
        ...taggedCmd[0]!,
        variant: "cmd",
      };
    }

    case "evt": {
      return msg;
    }
  }
}

function tagOutMsgs<TTag extends string, T extends AppClientTypes>(
  tag: TTag,
  msg?: OutMsg<T>[]
): OutMsg<{
  ClientCtx: T["ClientCtx"];
  ClientModel: T["ClientModel"];
  ClientMsg: { t: TTag; c: T["ClientMsg"] };
  ToClient: { t: TTag; c: T["ToClient"] };
  ToServer: { t: TTag; c: T["ToServer"] };
  ViewCtx: T["ViewCtx"];
  Cmd: T["Cmd"];
}>[] {
  return msg?.map((m) => tagOutMsg(tag, m)) ?? [];
}

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
const chain = <T extends AppClientTypes>(
  initial: Output<T>,
  ...updaters: ((input: T["ClientModel"]) => Output<T>)[]
): Output<T> => {
  const outMsg: OutMsg<T>[] = initial.msg ? [...initial.msg] : [];
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

export const AppClient = {
  tagOutMsgs,
  chain,
};
