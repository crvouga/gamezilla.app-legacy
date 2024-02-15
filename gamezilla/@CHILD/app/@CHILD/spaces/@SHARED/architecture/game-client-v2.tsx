import { Eff, Sub } from "gamezilla/@SHARED/core"
import { EventMeta, WithEventId } from "../event"
import { VDom } from "gamezilla/@SHARED/vdom"

//
//
//
//
//

export type GameClientModuleTypes = {
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx: any
  /**
   * `Model` is the state of the module
   */
  Model: any
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
   */
  Msg: any
  /**
   * `MsgToClient` is a message to send to the client component of the module
   */
  MsgToClient: any
  /**
   * `MsgToServer` is a message to send to the client component of the module
   */
  MsgToServer: any
  /**
   * `MsgInCmd` is a message from other modules. Usually verbs
   */
  MsgInCmd: any
  /**
   * `MsgInEvent` is a message to notify other modules. Usually past tense verbs
   */
  MsgInEvent: any
  /**
   * `MsgOutCmd` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
   */
  MsgOutCmd: any
  /**
   * `MsgOutEvent` is a message that is only produced by this module. Always past tense verbs
   */
  MsgOutEvent: any
  /**
   *
   */
  MsgGame: any
  /**
   *
   */
  ModelGame: any
}

//
//
// Input
//
//

export type Input<T extends GameClientModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T["Ctx"]
  /**
   * `model` is the current state of the module
   */
  model: T["Model"]
  /**
   * `location`
   */
  // location: T["Location"];
  /**
   * `msg`
   */
  msg?: T["Msg"] | null
  /**
   * `msgServer` is a message from the server
   */
  msgServer?: T["MsgToClient"] | null
  /**
   * `msgEvt`
   */
  msgEvt?: T["MsgInEvent"] | null
  /**
   * `msgCmd`
   */
  msgCmd?: T["MsgInCmd"] | null

  /**
   * `modelGame` is the current state of the game. This is shared and auto synced between client and server.
   */
  modelGame: T["ModelGame"]
  /**
   * `msgGame` is an msgEvt of game
   */
  msgGame?: (T["MsgGame"] & EventMeta) | null
}

//
//
// Output
//
//

export type Output<T extends GameClientModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T["Model"]
  /**
   * `eff` is a side effect to be performed. May dispatch a message
   */
  eff?: Eff<T["Msg"]>
  /**
   * `msgCmd` is a message to one other module. Always present tense
   */
  msgCmd?: T["MsgOutCmd"][]
  /**
   * `msgEvt` is a message to many other modules. Always past tense
   */
  msgEvt?: T["MsgOutEvent"][]
  /**
   *  `msgGame` are events that occurred in the game. Shared with the server side
   */
  msgGame?: WithEventId<T["MsgGame"]>[]
}

/**
 * `GameClientModule` represents a client side app module
 */
export type GameClientModule<T extends GameClientModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: T["Model"]

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Output<T>

  /**
   * `subscriptions` is dispatchs msgs specific to the module
   */
  subscriptions: (input: {
    ctx: T["Ctx"]
    modelGame: T["ModelGame"]
    model: T["Model"]
  }) => Sub<T["Msg"]>

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T["Ctx"]
    modelGame: T["ModelGame"]
    model: T["Model"]
    dispatch: (msg: T["Msg"]) => void
  }) => VDom

  /**
   *
   */
  ViewFeedItem: (input: {
    ctx: T["Ctx"]
    msgGame: T["MsgGame"]
    modelGame: T["ModelGame"]
    dispatch: (msg: T["Msg"]) => void
  }) => VDom
}

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
  const [update, ...rest] = updates

  if (!update) {
    return acc
  }

  const updated = update(acc.model)

  const accNew: Output<T> = {
    model: updated.model,
    eff: Eff.batch([acc.eff, updated.eff]),
    msgCmd: [...(acc.msgCmd ?? []), ...(updated.msgCmd ?? [])],
    msgEvt: [...(acc.msgEvt ?? []), ...(updated.msgEvt ?? [])],
    msgGame: [...(acc.msgGame ?? []), ...(updated.msgGame ?? [])],
  }

  return chainUpdates(accNew, ...rest)
}

const tagOutput = <
  TTag extends string,
  T extends GameClientModuleTypes,
  TTaggedCmd extends GameClientModuleTypes["MsgOutCmd"],
>(
  tag: TTag,
  tagCmd: (msgCmd: T["MsgOutCmd"][]) => TTaggedCmd[],
  output: Output<T>,
): {
  model: { t: TTag; c: T["Model"] }

  eff?: Eff<{ t: TTag; c: T["Msg"] }>
  /**
   *
   */
  msgCmd?: TTaggedCmd[]
  /**
   *
   */
  msgEvt?: T["MsgOutEvent"][]
  /**
   *
   */
  msgGame?: WithEventId<{ t: TTag; c: T["MsgGame"] }>[]
} => {
  return {
    model: {
      t: tag,
      c: output.model,
    },
    msgCmd: output.msgCmd ? tagCmd(output.msgCmd) : [],
    eff: Eff.tag(tag, output.eff),
    msgEvt: output.msgEvt,
    msgGame: output.msgGame?.map((c) => {
      const child = { ...c }
      delete child.eventId
      return {
        eventId: c.eventId,
        c: child,
        t: tag,
      }
    }),
  }
}

export const GameClientModule = {
  chainUpdates,
  tagOutput,
}
