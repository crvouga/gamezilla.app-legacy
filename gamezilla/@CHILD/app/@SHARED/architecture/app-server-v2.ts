import { Eff, Sub } from "gamezilla/@SHARED/core";

//
//
//
//
//

export type ServerModuleTypes = {
  /**
   * `Model` is the state of the module
   */
  Model: any;
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an event
   */
  Msg: any;
  /**
   * `FromClient` is a message from the client
   */
  FromClient: any;
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

//
//
// Input
//
//

type InputVariant<T extends ServerModuleTypes> =
  | { t: "msg"; msg: T["Msg"] }
  | { t: "from-client"; msg: T["FromClient"] }
  | { t: "evt"; msg: T["InEvt"] }
  | { t: "cmd"; msg: T["InCmd"] };

type InputBase<T extends ServerModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T["Ctx"];
  /**
   * `model` is the current state of the module
   */
  model: T["Model"];
};

export type Input<T extends ServerModuleTypes> = InputBase<T> & InputVariant<T>;

//
//
// Output
//
//

export type OutputMsg<T extends ServerModuleTypes> =
  | { v: "cmd"; c: T["OutCmd"] }
  | { v: "evt"; c: T["OutEvt"] };

export type Output<T extends ServerModuleTypes> = {
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

/**
 * `ServerModule` represents a server side app module
 */
export type ServerModule<T extends ServerModuleTypes> = {
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
};
