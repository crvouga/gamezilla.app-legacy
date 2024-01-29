import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { EventMeta, WithEventId } from "../event";

//
//
//
//
//

export type GameServerModuleTypes = {
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
  /**
   *
   */
  MsgGame: any;
  /**
   *
   */
  ModelGame: any;
  /**
   *
   */
  Deps: any;
};

//
//
// Input
//
//

export type Input<T extends GameServerModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T["Ctx"];
  /**
   * `model` is the current state of the module
   */
  model: T["Model"];
  /**
   * `modelGame` is the current state of the game. This is shared between client and server.
   */
  modelGame: T["ModelGame"];
  /**
   * `msgGame` is an msgEvt of game
   */
  msgGame?: (T["MsgGame"] & EventMeta) | null;
  /**
   * `msg`
   */
  msg?: T["Msg"] | null;
  /**
   * `msgServer`
   */
  msgClient?:
    | (T["MsgToServer"] & {
        clientId: ClientId;
        sessionId: SessionId;
        userId: UserId;
      })
    | null;
  /**
   * `msgEvt`
   */
  msgEvt?: T["MsgInEvent"] | null;
  /**
   * `msgCmd`
   */
  msgCmd?: T["MsgInCmd"] | null;
  /**
   *
   */
  deps: T["Deps"];
};

//
//
// Output
//
//

export type Output<T extends GameServerModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T["Model"];
  /**
   * `eff` is a side effect to be performed. May dispatch a message
   */
  eff?: Eff<T["Msg"]>;
  /**
   * `msgCmd` is a message to one other module. Always present tense
   */
  msgCmd?: T["MsgOutCmd"][];
  /**
   * `msgEvt` is a message to many other modules. Always past tense
   */
  msgEvt?: T["MsgOutEvent"][];
  /**
   *  `msgGame` is an msgEvt that occurred in the game. Shared with the client side
   */
  msgGame?: WithEventId<T["MsgGame"]>[];
};

/**
 * `GameServerModule` represents a server side app module
 */
export type GameServerModule<T extends GameServerModuleTypes> = {
  /**
   * `deps` are all of the dependencies you neeed to inject
   **/
  deps: () => Promise<T["Deps"]>;
  /**
   * `init` is the initial state of the module
   */
  init: T["Model"];

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Promise<Output<T>>;

  /**
   * `subscriptions` is dispatchs msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    modelGame: T["ModelGame"];
    model: T["Model"];
  }) => Promise<Sub<T["Msg"]>>;
};

//
//
//
//
//
//
//
//

const chainUpdates = async <T extends GameServerModuleTypes>(
  acc: Output<T>,
  ...updates: ((model: T["Model"]) => Promise<Output<T>>)[]
): Promise<Output<T>> => {
  const [update, ...rest] = updates;

  if (!update) {
    return acc;
  }

  const updated = await update(acc.model);

  const accNew: Output<T> = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
    msgGame: [...(acc.msgGame ?? []), ...(updated.msgGame ?? [])],
  };

  return chainUpdates(accNew, ...rest);
};

const tagOutput = <
  TTag extends string,
  T extends GameServerModuleTypes,
  TTaggedCmd extends GameServerModuleTypes["MsgOutCmd"]
>(
  tag: TTag,
  tagCmd: (msgCmd: T["MsgOutCmd"][]) => TTaggedCmd[] | null | undefined,
  output: Output<T>
): {
  model: { t: TTag; c: T["Model"] };

  eff?: Eff<{ t: TTag; c: T["Msg"] }>;
  /**
   *
   */
  msgCmd?: TTaggedCmd[];
  /**
   *
   */
  msgEvt?: T["MsgOutEvent"][];
  /**
   *
   */
  msgGame?: WithEventId<{ t: TTag; c: T["MsgGame"] }>[];
} => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) ?? [] : [],
    eff: Eff.tag(tag, output.eff),
    msgEvt: output.msgEvt,
    msgGame: output.msgGame?.map((c) => ({
      eventId: c.eventId,
      c: c,
      t: tag,
    })),
  };
};

export const GameServerModule = {
  chainUpdates,
  tagOutput,
};
