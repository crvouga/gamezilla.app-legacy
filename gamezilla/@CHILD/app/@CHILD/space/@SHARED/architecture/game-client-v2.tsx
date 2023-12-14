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
  /**
   *
   */
  GameEvent: any;
  /**
   *
   */
  GameState: any;
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
  model?: T["Model"] | null;
  /**
   *
   */
  gameState: T["GameState"];
  /**
   *
   */
  gameEvent?: (T["GameEvent"] & EventMeta) | null;
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

export type Output<T extends GameClientModuleTypes> = {
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
  /**
   *
   */
  gameEvent?: WithEventId<T["GameEvent"]>[];
};

/**
 * `GameClientModule` represents a client side app module
 */
export type GameClientModule<T extends GameClientModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: {
    ctx: T["Ctx"];
    gameState: T["GameState"];
    model?: T["Model"] | null;
  }) => Output<T>;

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Output<T>;

  /**
   * `subscriptions` is emits msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"];
    gameState: T["GameState"];
    model?: T["Model"] | null;
  }) => Sub<T["Msg"]>;

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T["Ctx"];
    gameState: T["GameState"];
    model?: T["Model"] | null;
    dispatch: (msg: T["Msg"]) => void;
  }) => VDom;

  /**
   *
   */
  ViewFeedItem: (input: {
    ctx: T["Ctx"];
    gameEvent: T["GameEvent"];
    gameState: T["GameState"];
    model?: T["Model"] | null;
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
    cmd: [...(acc.cmd ?? []), ...(updated.cmd ?? [])],
    evt: [...(acc.evt ?? []), ...(updated.evt ?? [])],
    gameEvent: [...(acc.gameEvent ?? []), ...(updated.gameEvent ?? [])],
  };

  return chainUpdates(accNew, ...rest);
};

const tagOutput = <
  TTag extends string,
  T extends GameClientModuleTypes,
  TTaggedCmd extends GameClientModuleTypes["OutCmd"]
>(
  tag: TTag,
  tagCmd: (cmd: T["OutCmd"][]) => TTaggedCmd[],
  output: Output<T>
): {
  model: { t: TTag; c: T["Model"] };

  eff?: Eff<{ t: TTag; c: T["Msg"] }>;
  /**
   *
   */
  cmd?: TTaggedCmd[];
  /**
   *
   */
  evt?: T["OutEvt"][];
  /**
   *
   */
  gameEvent?: WithEventId<{ t: TTag; c: T["GameEvent"] }>[];
} => {
  return {
    model: { t: tag, c: output.model },
    cmd: output.cmd ? tagCmd(output.cmd) : [],
    eff: Eff.tag(tag, output.eff),
    evt: output.evt,
    gameEvent: output.gameEvent?.map((c) => ({
      eventId: c.eventId,
      c: c,
      t: tag,
    })),
  };
};

const untagInput = <TTag extends string, T extends GameClientModuleTypes>(
  tag: TTag,
  input: {
    ctx: T["Ctx"];

    model?: { t: TTag; c: T["Model"] } | { t: string; c: unknown } | null;
    /**
     *
     */
    gameState: { t: TTag; c: T["GameState"] } | { t: string; c: unknown };
    /**
     *
     */
    gameEvent?:
      | { t: TTag; c: T["GameEvent"] & EventMeta }
      | { t: string; c: unknown }
      | null;
    /**
     *
     */
    msg?: { t: TTag; c: T["Msg"] } | { t: string; c: unknown } | null;
    /**
     *
     */
    fromServer?:
      | { t: TTag; c: T["ToClient"] }
      | { t: string; c: unknown }
      | null;
    /**
     *
     */
    evt?: T["InEvt"] | null;
    /**
     *
     */
    cmd?: T["InCmd"] | null;
  }
) => {
  return {
    model: input.model?.t === tag ? input.model.c : null,
    gameState: input.gameState.t === tag ? input.gameState.c : null,
    msg: input.msg?.t === tag ? input.msg.c : null,
    fromServer: input.fromServer?.t === tag ? input.fromServer.c : null,
    evt: input.evt,
    cmd: input.cmd,
    gameEvent: input.gameEvent?.t === tag ? input.gameEvent.c : null,
  };
};

export const GameClientModule = {
  chainUpdates,
  tagOutput,
  untagInput,
};
