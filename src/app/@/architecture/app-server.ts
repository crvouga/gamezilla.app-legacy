import { type Sub } from '~/@/sub'
import { Msg } from '~/@/msg/msg'
import type { ClientId, SessionId, UserId } from '~/app/@/data'

//
//
//
//
//

export type AppServerModuleTypes = {
  /**
   * `Deps` is the dependencies of the module
   */
  Deps?: any
  /**
   * `Ctx` is data passed down from parent modules
   */
  Ctx?: any
  /**
   * `Msg` is a message that is local to the module. Should almost always be past tense like an msgEvt
   */
  Msg?: any
  /**
   * `MsgToClient` is a message to send to the client component of the module
   */
  MsgToClient?: any
  /**
   * `MsgToServer` is a message to send to the client component of the module
   */
  MsgToServer?: any
  /**
   * `MsgCmdIn` is a message from other modules. Usually verbs
   */
  MsgCmdIn?: any
  /**
   * `MsgEvtIn` is a message to notify other modules. Usually past tense verbs
   */
  MsgEvtIn?: any
  /**
   * `MsgCmdOut` is a message to update some other consuming module. Always present tense verbs. Always Only for one module
   */
  MsgCmdOut?: any
  /**
   * `MsgEvtOut` is a message that is only produced by this module. Always past tense verbs
   */
  MsgEvtOut?: any
}

//
//
// Input
//
//

export type Input<T extends AppServerModuleTypes> = {
  /**
   * `deps` are the dependencies of the module
   */
  deps: T['Deps']
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
  msgClient?:
    | (T['MsgToServer'] & {
        clientId: ClientId
        sessionId: SessionId
        userId?: UserId | null
      })
    | null
  /**
   *
   */
  msgEvt?: T['MsgEvtIn'] | null
  /**
   *
   */
  msgCmd?: T['MsgCmdIn'] | null
}

//
//
// Output
//
//

export type Output<T extends AppServerModuleTypes> = {
  /**
   *
   */
  msgCmd?: T['MsgCmdOut'][]
  /**
   *
   */
  msgEvt?: T['MsgEvtOut'][]
}

/**
 * `AppServerModule` represents a server side app module
 */
export type AppServerModule<T extends AppServerModuleTypes> = {
  initDeps: (input: { ctx: T['Ctx'] }) => Promise<T['Deps']>
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
  subscriptions: (input: { ctx: T['Ctx']; deps: T['Deps'] }) => Promise<Sub<T['Msg']>>
}

type MaybePromise<T> = T | Promise<T>

const andThen = async <T extends AppServerModuleTypes>(
  accPromise: MaybePromise<Output<T>>,
  ...updates: (() => MaybePromise<Output<T>>)[]
): Promise<Output<T>> => {
  let acc = await accPromise
  for (const update of updates) {
    const updated = await update()
    acc = {
      msgCmd: Msg.batch(acc.msgCmd, updated.msgCmd),
      msgEvt: Msg.batch(acc.msgEvt, updated.msgEvt)
    }
  }
  return acc
}

export const AppServerModule = {
  andThen
}
