import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { EventMeta, WithEventId } from "../event";

//
//
//
//
//

export type GameClientModuleTypes = {
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
  GameMsg: any;
  /**
   *
   */
  GameModel: any;
};

//
//
// Input
//
//

export type Input<T extends GameClientModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T["Ctx"];
  /**
   * `model` is the current state of the module
   */
  model: T["Model"];
  /**
   * `location`
   */
  // location: T["Location"];
  /**
   * `msg`
   */
  msg?: T["Msg"] | null;
  /**
   * `msgFromServer` is a message from the server
   */
  msgFromServer?: T["ToClient"] | null;
  /**
   * `msgEvent`
   */
  msgEvent?: T["InEvent"] | null;
  /**
   * `msgCmd`
   */
  msgCmd?: T["InCmd"] | null;

  /**
   * `modelGame` is the current state of the game. This is shared between client and server.
   */
  modelGame: T["GameModel"];
  /**
   * `msgGame` is an msgEvent of game
   */
  msgGame?: (T["GameMsg"] & EventMeta) | null;
};

//
//
// Output
//
//

export type Output<T extends GameClientModuleTypes> = {
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
  msgCmd?: T["OutCmd"][];
  /**
   * `msgEvent` is a message to many other modules. Always past tense
   */
  msgEvent?: T["OutEvent"][];
  /**
   *  `msgGame` is an msgEvent that occurred in the game. Shared with the server side
   */
  msgGame?: WithEventId<T["GameMsg"]>[];
};

/**
 * `GameClientModule` represents a client side app module
 */
export type GameClientModule<T extends GameClientModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: T["Model"];

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Output<T>;

  /**
   * `subscriptions` is dispatchs msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    modelGame: T["GameModel"];
    model: T["Model"];
  }) => Sub<T["Msg"]>;

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T["Ctx"];
    modelGame: T["GameModel"];
    model: T["Model"];
    dispatch: (msg: T["Msg"]) => void;
  }) => VDom;

  /**
   *
   */
  ViewFeedItem: (input: {
    ctx: T["Ctx"];
    msgGame: T["GameMsg"];
    modelGame: T["GameModel"];
    dispatch: (msg: T["Msg"]) => void;
  }) => VDom;
};

//
//
//
//
//
//
//
//

const chainUpdates = <T extends GameClientModuleTypes>(
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
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvent: [...(acc.msgEvent ?? []), ...(updated.msgEvent ?? [])],
    msgGame: [...(acc.msgGame ?? []), ...(updated.msgGame ?? [])],
  };

  return chainUpdates(accNew, ...rest);
};

const tagOutput = <
  TTag extends string,
  T extends GameClientModuleTypes,
  TTaggedCmd extends GameClientModuleTypes["OutCmd"]
>(
  tag: TTag,
  tagCmd: (msgCmd: T["OutCmd"][]) => TTaggedCmd[],
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
  msgGame?: WithEventId<{ t: TTag; c: T["GameMsg"] }>[];
} => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) : [],
    eff: Eff.tag(tag, output.eff),
    msgEvent: output.msgEvent,
    msgGame: output.msgGame?.map((c) => {
      const child = { ...c };
      delete child.msgEventId;
      return {
        msgEventId: c.msgEventId,
        c: child,
        t: tag,
      };
    }),
  };
};

export const GameClientModule = {
  chainUpdates,
  tagOutput,
};
