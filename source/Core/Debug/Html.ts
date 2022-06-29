/**
 * This module makes available a debugging utility for `elm-ts` applications running `Html` programs.
 *
 * `elm-ts` ships with a [Redux DevTool Extension](https://github.com/zalmoxisus/redux-devtools-extension) integration, falling back to a simple debugger via standard browser's [`console`](https://developer.mozilla.org/en-US/docs/Web/API/Console) in case the extension is not available.
 *
 * **Note:** debugging is to be considered unsafe by design so it should be used only in **development**.
 *
 * This is an example of usage:
 * ```ts
 * import {react, Cmd} from 'elm-ts'
 * import {programWithDebugger} from 'elm-ts/lib/Debug/Html'
 * import { render } from 'react-dom'
 *
 * type Model = number
 * type Msg = 'INCREMENT' | 'DECREMENT'
 *
 * declare const init: [Model, Cmd.none]
 * declare function update(msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>]
 * declare function view(model: Model): View.View<Msg>
 *
 * const program = process.NODE_ENV === 'production' ? react.program : programWithDebugger
 *
 * const main = program(init, update, view)
 *
 * react.run(main, dom => render(dom, document.getElementById('app')))
 * ```
 *
 * @since 0.5.3
 */
import * as Rx from "rxjs"
import * as Cmd from "../Cmd"
import * as Html from "../Html"
import * as Sub from "../Sub"
import {
  DebugData,
  DebuggerR,
  RunDebugger,
  debugInit,
  subscriptionsWithDebug,
  updateWithDebug,
} from "./commons"

/**
 * Adds a debugging capability to a generic `Html` `Program`.
 *
 * It tracks every `Message` dispatched and resulting `Model` update.
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
 * @category constructors
 * @since 0.5.3
 */
export const Program = <Model, Msg, Dom>({
  init,
  update,
  view,
  subscriptions,
}: {
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Html.Program<Model, Msg, Dom> => {
  return createProgram({
    stopSignal: Rx.EMPTY,
    init,
    update,
    view,
    subscriptions,
  })
}

// --- Internal
const createProgram = <Model, Msg, Dom>({
  stopSignal,
  init,
  update,
  view,
  subscriptions,
}: {
  stopSignal: Rx.Observable<unknown>
  init: [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Html.Program<Model, Msg, Dom> => {
  const initModel = init[0]

  const debug$ = new Rx.BehaviorSubject<DebugData<Model, Msg>>([
    debugInit(),
    initModel,
  ])
  const debugId$ = new Rx.BehaviorSubject<string | undefined>(undefined)

  const program = Html.Program({
    init,
    update: updateWithDebug<Model, Msg>({
      debug$,
      debugId$,
      update,
    }),
    view,
    subscriptions: subscriptionsWithDebug({
      subscriptions,
      debugId$,
    }),
  })

  // --- Run the debugger
  // --- we need to make a type assertion for `dispatch` because we cannot change the intrinsic `msg` type of `program`;
  // --- otherwise `programWithDebugger` won't be usable as a transparent extension/substitution of `Html`'s programs
  const runDebugger = RunDebugger<Model, Msg>(window, stopSignal)

  runDebugger({
    debug$,
    init: initModel,
    dispatch: program.dispatch as DebuggerR<Model, Msg>["dispatch"],
  })()

  return program
}

export const run = <Model, Msg, Dom>(
  program: Html.Program<Model, Msg, Dom>,
  renderer: Html.Renderer<Dom>,
): void => {
  // why?
  // wait for redux devtools debugger to start before running program
  // because messages were being dispatched before the dev tools started
  // resulting in initial messages not being logged
  //
  // todo: actually subscribe to the redux dev tools start message instead of using a timeout
  setTimeout(() => {
    Html.run(program, renderer)
  }, 1000)
}
