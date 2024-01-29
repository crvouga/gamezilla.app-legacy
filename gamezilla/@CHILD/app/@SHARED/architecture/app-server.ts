import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Eff, Sub } from "gamezilla/@SHARED/core";

//
//
//
//
//

export type AppServerModuleTypes = {
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx: any;
  /**
   * `Model` is the state of the module
   */
  Model: any;
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
   */
  Msg: any;
  /**
   * `MsgToClient` is a message to send to the client component of the module
   */
  MsgToClient: any;
  /**
   * `MsgToServer` is a message to send to the client component of the module
   */
  MsgToServer: any;
  /**
   * `MsgInCmd` is a message from other modules. Usually verbs
   */
  MsgInCmd: any;
  /**
   * `MsgInEvent` is a message to notify other modules. Usually past tense verbs
   */
  MsgInEvent: any;
  /**
   * `MsgOutCmd` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
   */
  MsgOutCmd: any;
  /**
   * `MsgOutEvent` is a message that is only produced by this module. Always past tense verbs
   */
  MsgOutEvent: any;
};

//
//
// Input
//
//

export type Input<T extends AppServerModuleTypes> = {
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
  msgFromClient?:
    | (T["MsgToServer"] & {
        clientId: ClientId;
        sessionId: SessionId;
        userId?: UserId | null;
      })
    | null;
  /**
   *
   */
  msgEvt?: T["MsgInEvent"] | null;
  /**
   *
   */
  msgCmd?: T["MsgInCmd"] | null;
};

//
//
// Output
//
//

export type Output<T extends AppServerModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T["Model"];
  /**
   * `eff` is a side effect to be performed. May dispatch a message
   */
  eff?: Eff<T["Msg"]>;
  /**
   *
   */
  msgCmd?: T["MsgOutCmd"][];
  /**
   *
   */
  msgEvt?: T["MsgOutEvent"][];
};

/**
 * `AppServerModule` represents a server side app module
 */
export type AppServerModule<T extends AppServerModuleTypes> = {
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
   * `subscriptions` is dispatchs msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    model: T["Model"];
  }) => Promise<Sub<T["Msg"]>>;
};

type MaybePromise<T> = T | Promise<T>;

const chainUpdates = async <T extends AppServerModuleTypes>(
  acc: Output<T>,
  ...updates: ((model: T["Model"]) => MaybePromise<Output<T>>)[]
): Promise<Output<T>> => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = await update(acc.model);

  const accNew: Output<T> = {
    model: { ...acc.model, ...updated.model },
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
  };

  return chainUpdates(accNew, ...rest);
};

export const AppServerModule = {
  chainUpdates,
};
