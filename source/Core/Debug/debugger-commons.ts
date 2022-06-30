import * as Rx from "rxjs"
import * as Cmd from "../Cmd"
import * as Platform from "../Platform"
import * as Sub from "../Sub"

//
//
//
// Model
//
//
//

export type Global = typeof window

export type DebugData<Model, Msg> = [DebugAction<Msg>, Model]

export type DebugAction<Msg> = DebugInit | DebugMsg<Msg>

export interface DebugInit {
  type: "INIT"
}

export const debugInit = (): DebugInit => ({ type: "INIT" })

export interface DebugMsg<Msg> {
  type: "MESSAGE"
  payload: Msg
}

export const debugMsg = <Msg>(payload: Msg): DebugMsg<Msg> => ({
  type: "MESSAGE",
  payload,
})

export type MsgWithDebug<Model, Msg> =
  | Msg
  | { type: "__DebugUpdateModel__"; payload: Model }
  | { type: "__DebugApplyMsg__"; payload: Msg }

export interface Debug<Model, Msg> {
  (data: DebugData<Model, Msg>): void
}

export interface Debugger<Model, Msg> {
  (d: DebuggerDeps<Model, Msg>): {
    debug: Debug<Model, Msg>
    stop: () => void
  }
}

export interface DebuggerDeps<Model, Msg> {
  init: Model
  debug$: Rx.BehaviorSubject<DebugData<Model, Msg>>
  dispatch: Platform.Dispatch<MsgWithDebug<Model, Msg>>
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

export const updateWithDebug =
  <Model, Msg>({
    debug$,
    debugId$,
    update,
  }: {
    debug$: Rx.BehaviorSubject<DebugData<Model, Msg>>
    debugId$: Rx.BehaviorSubject<string | undefined>
    update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  }) =>
  (msg: MsgWithDebug<Model, Msg>, model: Model): [Model, Cmd.Cmd<Msg>] => {
    if ("type" in msg) {
      switch (msg.type) {
        case "__DebugUpdateModel__":
          return [msg.payload, Cmd.None]

        case "__DebugApplyMsg__":
          return [update(msg.payload, model)[0], Cmd.None]
      }
    }

    const [modelNew, cmdNew] = update(msg, model)

    const debugId = debugIdGen.next().value

    // @ts-ignore
    modelNew[DEBUG_ID_KEY] = debugId

    debugId$.next(debugId)

    debug$.next([debugMsg(msg), model])

    return [modelNew, cmdNew]
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
    debugId$: Rx.BehaviorSubject<string | undefined>
  }) =>
  (model: Model) => {
    // @ts-ignore
    const debugId: string = model[DEBUG_ID_KEY]

    const latestDebugId = debugId$.getValue()

    if (latestDebugId === debugId) {
      return subscriptions(model)
    }

    console.info(
      `[debugger] Detected time traveling so subscriptions are being ignored. latestDebugId: ${latestDebugId} debugId: ${debugId}`,
    )

    return Sub.None
  }
