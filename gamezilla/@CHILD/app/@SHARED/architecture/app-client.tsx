import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";

//
//
//
//
//

export type AppClientModuleTypes = {
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx: any;
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
  ToClient: any;
  /**
   * `ToServer` is a message to send to the client component of the module
   */
  ToServer: any;
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

//
//
// Input
//
//

export type Input<T extends AppClientModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T["Ctx"];
  /**
   * `model` is the current state of the module
   */
  model: T["Model"];
  /**
   *
   */
  msg?: T["Msg"] | null;
  /**
   *
   */
  fromServer?: T["ToClient"] | null;
  /**
   *
   */
  evt?: T["InEvt"] | null;
  /**
   *
   */
  cmd?: T["InCmd"] | null;
};

//
//
// Output
//
//

export type Output<T extends AppClientModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T["Model"];
  /**
   * `eff` is a side effect to be performed. May emit a message
   */
  eff?: Eff<T["Msg"]>;
  /**
   *
   */
  cmd?: T["OutCmd"][];
  /**
   *
   */
  evt?: T["OutEvt"][];
};

/**
 * `AppClientModule` represents a client side app module
 */
export type AppClientModule<T extends AppClientModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: { ctx: T["Ctx"]; stored: T["Model"] | null }) => Output<T>;

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Output<T>;

  /**
   * `subscriptions` is emits msgs specific to the module
   */
  subscriptions: (input: { ctx: T["Ctx"]; model: T["Model"] }) => Sub<T["Msg"]>;

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T["Ctx"];
    model: T["Model"];
    dispatch: (msg: T["Msg"]) => void;
  }) => VDom;
};

const chainUpdates = <T extends AppClientModuleTypes>(
  acc: Output<T>,
  ...updates: ((model: T["Model"]) => Output<T>)[]
): Output<T> => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = update(acc.model);

  const accNew: Output<T> = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    cmd: [...(acc.cmd ?? []), ...(updated.cmd ?? [])],
    evt: [...(acc.evt ?? []), ...(updated.evt ?? [])],
  };

  return chainUpdates(accNew, ...rest);
};

export const AppClientModule = {
  chainUpdates,
};
