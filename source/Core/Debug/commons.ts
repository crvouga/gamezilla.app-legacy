/**
 * Common utilities and type definitions for the `Debug` module.
 *
 * @since 0.5.0
 */
import { BehaviorSubject, Observable } from "rxjs"
import { takeUntil } from "rxjs/operators"
import * as Cmd from "../Cmd"
import * as IO from "../IO"
import * as Option from "../Option"
import * as Sub from "../Sub"
import * as Console from "./console"
import * as ReduxDevtool from "./redux-devtool"
import { Dispatch } from "../Platform"
import { pipe } from "../pipe"

/**
 * @category model
 * @since 0.5.0
 */
export type Global = typeof window

/**
 * @category model
 * @since 0.5.0
 */
export type DebugData<Model, Msg> = [DebugAction<Msg>, Model]

/**
 * @category model
 * @since 0.5.0
 */
export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>

/**
 * @category model
 * @since 0.5.0
 */
export interface DebugInit {
  type: "INIT"
}
/**
 * Creates a `DebugInit`
 * @category constructos
 * @since 0.5.0
 */
export const debugInit = (): DebugInit => ({ type: "INIT" })

/**
 * @category model
 * @since 0.5.0
 */
export interface DebugMsg<Msg> {
  type: "MESSAGE"
  payload: Msg
}
/**
 * Creates a `DebugMsg`
 * @category constructors
 * @since 0.5.0
 */
export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ({
  type: "MESSAGE",
  payload,
})

/**
 * Extends `Msg` with a special kind of message from Debugger
 * @category model
 * @since 0.5.0
 */
export type MsgWithDebug<Model, Msg> =
  | Msg
  | { type: "__DebugUpdateModel__"; payload: Model }
  | { type: "__DebugApplyMsg__"; payload: Msg }

/**
 * Defines a generic debugging function
 * @category model
 * @since 0.5.0
 */
export interface Debug<Model, Msg> {
  (data: DebugData<Model, Msg>): void
}

/**
 * Defines a generic `Debugger`
 * @category model
 * @since 0.5.4
 */
export interface Debugger<Model, Msg> {
  (d: DebuggerR<Model, Msg>): {
    debug: Debug<Model, Msg>
    stop: () => void
  }
}

/**
 * Defines the dependencies for a `Debugger` function.
 * @category model
 * @since 0.5.0
 */
export interface DebuggerR<Model, Msg> {
  init: Model
  debug$: BehaviorSubject<DebugData<Model, Msg>>
  dispatch: Dispatch<MsgWithDebug<Model, Msg>>
}

/**
 * Adds debugging capability to the provided `update` function.
 *
 * It tracks through the `debug$` stream every `Message` dispatched and resulting `Model` update.
 *
 * It also lets directly updating the application's state with a special `Message` of type:
 *
 * ```ts
 * {
 *   type: '__DebugUpdateModel__'
 *   payload: Model
 * }
 * ```
 *
 * or applying a message with:
 * ```ts
 * {
 *   type: '__DebugApplyMsg__';
 *   payload: Msg
 * }
 * ```
 * @category utils
 * @since 0.5.3
 */

export const DEBUG_ID_KEY = "debugId"

const makeDebugIdGen = function* () {
  let id = 0
  while (true) {
    yield `debugId-${id}`
    id = id + 1
  }
}

const debugIdGen = makeDebugIdGen()

export function updateWithDebug<Model, Msg>({
  debug$,
  debugId$,
  update,
}: {
  debug$: BehaviorSubject<DebugData<Model, Msg>>
  debugId$: BehaviorSubject<string | undefined>
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
}): (msg: MsgWithDebug<Model, Msg>, model: Model) => [Model, Cmd.Cmd<Msg>] {
  return (msg, model) => {
    if ("type" in msg) {
      switch (msg.type) {
        case "__DebugUpdateModel__":
          return [msg.payload, Cmd.none]

        case "__DebugApplyMsg__":
          return [update(msg.payload, model)[0], Cmd.none]
      }
    }

    const [modelNew, cmdNew] = update(msg, model)

    const debugId = debugIdGen.next().value

    console.log(
      "updateWithDebug",
      debugId,
      " ",
      "type" in msg
        ? // @ts-ignore
          msg["type"]
        : msg,
    )

    // @ts-ignore
    modelNew[DEBUG_ID_KEY] = debugId

    debugId$.next(debugId)

    debug$.next([debugMsg(msg), model])

    return [modelNew, cmdNew]
  }
}

/**
 *
 * We want to ignore subscriptions when time travel debugging
 *
 **/

export const subscriptionsWithDebug =
  <Model, Msg>({
    subscriptions,
    debugId$,
  }: {
    subscriptions: (model: Model) => Sub.Sub<Msg>
    debugId$: BehaviorSubject<string | undefined>
  }) =>
  (model: Model) => {
    // @ts-ignore
    const debugId: string = model[DEBUG_ID_KEY]

    const latestDebugId = debugId$.getValue()

    if (latestDebugId === debugId) {
      console.log("subs listening", { debugId, latestDebugId })

      return subscriptions(model)
    }

    console.log("sub ignoring", { debugId, latestDebugId })

    return Sub.none
  }

/**
 * Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream
 *
 * **Warning:** this function **SHOULD** be considered as an internal method; using it in your application **SHOULD** be avoided.
 * @category utils
 * @since 0.5.4
 */
export function RunDebugger<Model, Msg>(
  global: Global,
  stopSignal: Observable<unknown>,
): (deps: DebuggerR<Model, Msg>) => IO.IO<void> {
  return (deps) => {
    return pipe(
      ReduxDevtool.getConnection<Model, Msg>(global),
      IO.map(
        Option.fold(
          () => Console.makeDebugger<Model, Msg>(),
          ReduxDevtool.makeDebugger,
        ),
      ),
      IO.chain((debuggerInstance) => () => {
        const { debug, stop } = debuggerInstance(deps)

        deps.debug$.pipe(takeUntil(stopSignal)).subscribe({
          next: debug,
          complete: stop,
        })
      }),
    )
  }
}
