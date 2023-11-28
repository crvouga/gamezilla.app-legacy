import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";

export type ClientModuleTypes = {
  /**
   * `Model` is the state of the module
   */
  Model: any;
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an event
   */
  Msg: any;
  /**
   * `ToClient` is a message to send to the client component of the module
   */
  FromServer: any;
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx: any;
  /**
   * `InCmd` is a message from other modules. Usually verbs
   */
  InCmd: any;
  /**
   * `InEvt` is a message to notify other modules. Usually past tense verbs
   */
  InEvt: any;
  /**
   * `OutCmd` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
   */
  OutCmd: any;
  /**
   * `OutEvt` is a message that is only produced by this module. Always past tense verbs
   */
  OutEvt: any;
};

export type InputMsg<T extends ClientModuleTypes> =
  | ({ v: "msg" } & T["Msg"])
  | ({ v: "from-server" } & T["FromServer"])
  | ({ v: "evt" } & T["InEvt"])
  | ({ v: "cmd" } & T["InCmd"]);

export type OutputMsg<T extends ClientModuleTypes> =
  | ({ v: "cmd" } & T["OutCmd"])
  | ({ v: "evt" } & T["OutEvt"]);

export type Output<T extends ClientModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T["Model"];
  /**
   * `eff` is a side effect to be performed. May emit a message
   */
  eff?: Eff<T["Msg"]>;
  /**
   * `msg` is out message like events and commands
   */
  msg?: OutputMsg<T>[];
};

export type ClientModule<T extends ClientModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: {
    //
    ctx: T["Ctx"];
    stored: T["Model"] | null;
  }) => Output<T>;

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: {
    ctx: T["Ctx"];
    model: T["Model"];
    msg: InputMsg<T>;
  }) => Output<T>;

  /**
   * `subscriptions` is emits msgs specific to the module
   */
  subscriptions: (input: {
    intervalId: string;
    ctx: T["Ctx"];
    model: T["Model"];
  }) => Sub<T["Msg"]>;

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T["Ctx"];
    dispatch: (msg: T["Msg"]) => void;
    model: T["Model"];
  }) => VDom;
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
export const chain = <TModel, TMsg, TOutMsg>(
  initial: { model: TModel; eff?: Eff<TMsg>; msg?: TOutMsg[] },
  ...updaters: ((input: TModel) => {
    model: TModel;
    eff?: Eff<TMsg>;
    msg?: TOutMsg[];
  })[]
): {
  model: TModel;
  eff: Eff<TMsg>;
  msg: TOutMsg[];
} => {
  const outMsg: TOutMsg[] = initial.msg ? [...initial.msg] : [];
  const eff: Eff<TMsg>[] = initial.eff ? [initial.eff] : [];

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

export const ClientModule = {
  chain,
};

export type BaseCmd<T> = T & { v: "cmd" };

export function Cmd<T>(cmd: T): BaseCmd<T> {
  return { v: "cmd", ...cmd };
}

export type BaseEvt<T> = T & { v: "evt" };

export function Evt<T>(evt: T): BaseEvt<T> {
  return { v: "evt", ...evt };
}

export type BaseMsg<T> = T & { v: "msg" };

export function Msg<T>(msg: T): BaseMsg<T> {
  return { v: "msg", ...msg };
}

export type BaseFromServer<T> = T & { v: "from-server" };

export function FromServer<T>(fromServer: T): BaseFromServer<T> {
  return { v: "from-server", ...fromServer };
}
