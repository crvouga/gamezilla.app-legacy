import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Eff, Sub } from "gamezilla/@SHARED/core";

//
//
//
//
//

export type ServerModuleTypes = {
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

export type Input<T extends ServerModuleTypes> = {
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
  fromClient?:
    | (T["ToServer"] & { clientId: ClientId; sessionId: SessionId })
    | null;
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
   *
   */
  cmd?: T["OutCmd"][];
  /**
   *
   */
  evt?: T["OutEvt"][];
};

/**
 * `ServerModule` represents a server side app module
 */
export type ServerModule<T extends ServerModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: {
    ctx: T["Ctx"];
    stored: T["Model"] | null;
  }) => Promise<Output<T>>;

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Promise<Output<T>>;

  /**
   * `subscriptions` is emits msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    model: T["Model"];
  }) => Promise<Sub<T["Msg"]>>;
};

type MaybePromise<T> = T | Promise<T>;

const composeUpdates = async <T extends ServerModuleTypes>(
  acc: Output<T>,
  updates: ((model: T["Model"]) => MaybePromise<Output<T>>)[]
): Promise<Output<T>> => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = await update(acc.model);

  const accNew: Output<T> = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    cmd: [...(acc.cmd ?? []), ...(updated.cmd ?? [])],
    evt: [...(acc.evt ?? []), ...(updated.evt ?? [])],
  };

  return composeUpdates(accNew, rest);
};

export const ServerModule = {
  composeUpdates,
};
