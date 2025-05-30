import { Msg } from '~/@/msg/msg'
import { type Sub } from '~/@/sub'

export type AppBackendModuleTypes = {
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx?: unknown
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
   */
  Msg?: unknown
  /**
   * `MsgIn`
   */
  MsgIn?: unknown
  /**
   * `MsgOut`
   */
  MsgOut?: unknown
}

export type Input<T extends AppBackendModuleTypes> = {
  /**
   * `ctx` is data passed down from parent modules
   */
  ctx: T['Ctx']
  /**
   *
   */
  msg?: T['Msg'] | null
  /**
   *
   */
  msgIn?: T['MsgIn'] | null
}

export type Output<T extends AppBackendModuleTypes> = {
  msgOut?: T['MsgOut'][]
}

/**
 * `AppBackendModule` represents a backend side app module
 */
export type AppBackendModule<T extends AppBackendModuleTypes> = {
  /**
   * `init` is the initial state of the module
   */
  init: (input: { ctx: T['Ctx'] }) => Promise<Output<T>>

  /**
   * `update` handles all the state transitions and business logic of the module
   */
  update: (input: Input<T>) => Promise<Output<T>>

  /**
   * `subscriptions` is dispatches msgs specific to the module
   */
  subscriptions: (input: { ctx: T['Ctx'] }) => Promise<Sub<T['Msg']>>
}

type MaybePromise<T> = T | Promise<T>

const andThen = async <T extends AppBackendModuleTypes>(
  accPromise: MaybePromise<Output<T>>,
  ...updates: (() => MaybePromise<Output<T>>)[]
): Promise<Output<T>> => {
  let acc: Output<T> = await accPromise
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgOut: Msg.batch(acc.msgOut, updated.msgOut),
    }
  }
  return acc
}

export const AppBackendModule = {
  andThen,
}
