import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { VDom } from '~/@/vdom/vdom'

export type AppFrontendModuleTypes = {
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx?: unknown
  /**
   * `Model` is the state of the module that lives in memory
   */
  Model?: Record<string, unknown>
  /**
   * `Msg` is a message that is local to the module. Should always be an event that happens in the module. Like `user-clicked-a-button`
   */
  Msg?: unknown
  /**
   * `MsgIn` is a message from other modules. Usually verbs
   */
  MsgIn?: unknown
  /**
   * `MsgOut` is a message to send to other modules. Usually past tense verbs
   */
  MsgOut?: unknown
  /**
   *  `ViewSlot` is a slot that the module can fill with a view
   */
  ViewSlot?: SlotInputTypes
  /**
   * `ViewEmits` is a slot that the module can fill with a view
   */
  ViewEmit?: EmitInputTypes
}

type SlotInputTypes = {
  [key: string]: unknown
}

type EmitInputTypes = {
  [key: string]: unknown
}
type SlotRenderFunctions<Slots> = Slots extends SlotInputTypes ? { [K in keyof Slots]: (input: Slots[K]) => VDom } : {}

type EmitFunctions<Emits> = Emits extends EmitInputTypes ? { [K in keyof Emits]: (input: Emits[K]) => void } : {}

export type Input<T extends AppFrontendModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules like `currentUser`, `currentScreen`, etc
   */
  ctx: T['Ctx']
  /**
   * `model` is the current state of the module.
   */
  model: T['Model']
  /**
   * `msg` is an event that happens in the frontend within this module. Like `user-clicked-a-button`
   */
  msg?: T['Msg'] | null
  /**
   * `msgIn` is a message from another module. Like `user-logged-out`, `screen-changed`
   */
  msgIn?: T['MsgIn'] | null
}

export type Output<T extends AppFrontendModuleTypes> = {
  /**
   * `model` will be the new state of the module
   */
  model: T['Model']
  /**
   * `eff` is a side effect to be performed. May dispatch a message
   */
  eff?: Eff<T['Msg']>
  /**
   * `msgOut` is a message to send to the parent module
   */
  msgOut?: T['MsgOut'][]
}

/**
 * `AppFrontendModule` represents a frontend side app module
 */
export type AppFrontendModule<T extends AppFrontendModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: { ctx: T['Ctx'] }) => Output<T>

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Output<T>

  /**
   * `subscriptions` is dispatches msgs specific to the module
   */
  subscriptions: (input: { ctx: T['Ctx']; model: T['Model'] }) => Sub<T['Msg']>

  /**
   * `View` is for rendering the UI for the module
   */
  View: (input: {
    ctx: T['Ctx']
    model: T['Model']
    dispatch: (msg: T['Msg']) => void
    slots?: SlotRenderFunctions<T['ViewSlot']>
    emits?: EmitFunctions<T['ViewEmit']>
  }) => VDom
}
/**
 * Chains multiple update functions together, merging their outputs.
 * Each update function receives the model from the previous update.
 * Effects and messages are batched together.
 *
 * @example
 * ```ts
 * const update = (input) => {
 *   return AppFrontendModule.andThen(
 *     { model: input.model }, // initial output
 *     (model) => updateFromMsg({ ...input, model }), // first update
 *     (model) => watchForLogin({ ...input, model }), // second update
 *   )
 * }
 * ```
 */
const andThen = <T extends AppFrontendModuleTypes>(
  initial: Output<T>,
  ...updates: ((model: T['Model']) => Output<T>)[]
): Output<T> => {
  let acc = initial
  for (const update of updates) {
    const updated = update(acc.model)
    acc = {
      model: {
        ...acc.model,
        ...updated.model,
      },
      eff: Eff.batch(acc.eff, updated.eff),
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    }
  }
  return acc
}

export const AppFrontendModule = {
  andThen,
}
