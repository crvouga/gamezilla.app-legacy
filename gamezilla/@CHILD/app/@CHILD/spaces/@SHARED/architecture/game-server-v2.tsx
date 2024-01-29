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
   * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvent
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
   * `InEvent` is a message to notify other modules. Usually past tense verbs
   */
  InEvent: any;
  /**
   * `OutCmd` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
   */
  OutCmd: any;
  /**
   * `OutEvent` is a message that is only produced by this module. Always past tense verbs
   */
  OutEvent: any;
  /**
   *
   */
  GameEvent: any;
  /**
   *
   */
  GameState: any;
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
   * `gameState` is the current state of the game. This is shared between client and server.
   */
  gameState: T["GameState"];
  /**
   * `msgGameEvent` is an msgEvent of game
   */
  msgGameEvent?: (T["GameEvent"] & EventMeta) | null;
  /**
   * `msg`
   */
  msg?: T["Msg"] | null;
  /**
   * `msgFromServer`
   */
  fromClient?:
    | (T["ToServer"] & {
        clientId: ClientId;
        sessionId: SessionId;
        userId: UserId;
      })
    | null;
  /**
   * `msgEvent`
   */
  msgEvent?: T["InEvent"] | null;
  /**
   * `msgCmd`
   */
  msgCmd?: T["InCmd"] | null;
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
   * `eff` is a side effect to be performed. May emit a message
   */
  eff?: Eff<T["Msg"]>;
  /**
   * `msgCmd` is a message to one other module. Always present tense
   */
  msgCmd?: T["OutCmd"][];
  /**
   * `msgEvent` is a message to many other modules. Always past tense
   */
  msgEvent?: T["OutEvent"][];
  /**
   *  `msgGameEvent` is an msgEvent that occurred in the game. Shared with the client side
   */
  msgGameEvent?: WithEventId<T["GameEvent"]>[];
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
   * `subscriptions` is emits msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    gameState: T["GameState"];
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
    msgEvent: [...(acc.msgEvent ?? []), ...(updated.msgEvent ?? [])],
    msgGameEvent: [
      ...(acc.msgGameEvent ?? []),
      ...(updated.msgGameEvent ?? []),
    ],
  };

  return chainUpdates(accNew, ...rest);
};

const tagOutput = <
  TTag extends string,
  T extends GameServerModuleTypes,
  TTaggedCmd extends GameServerModuleTypes["OutCmd"]
>(
  tag: TTag,
  tagCmd: (msgCmd: T["OutCmd"][]) => TTaggedCmd[] | null | undefined,
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
  msgEvent?: T["OutEvent"][];
  /**
   *
   */
  msgGameEvent?: WithEventId<{ t: TTag; c: T["GameEvent"] }>[];
} => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) ?? [] : [],
    eff: Eff.tag(tag, output.eff),
    msgEvent: output.msgEvent,
    msgGameEvent: output.msgGameEvent?.map((c) => ({
      msgEventId: c.msgEventId,
      c: c,
      t: tag,
    })),
  };
};

export const GameServerModule = {
  chainUpdates,
  tagOutput,
};
