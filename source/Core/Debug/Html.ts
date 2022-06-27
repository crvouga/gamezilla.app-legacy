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
  DEBUG_ID_KEY,
  DebugData,
  DebuggerR,
  RunDebugger,
  debugInit,
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
export function Program<Model, Msg, Dom>(
  init: [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  view: (model: Model) => Html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): Html.Program<Model, Msg, Dom> {
  return createProgram(Rx.EMPTY, init, update, view, subscriptions)
}

/**
 * A function that requires an `Observable` and returns a `programWithDebugger()` function: the underlying debugger will stop when the `Observable` emits a value.
 * @category constructors
 * @since 0.5.4
 */
export function ProgramWithStop<Model, Msg, Dom>(
  stopDebuggerOn: Rx.Observable<unknown>,
): <S extends Model, M extends Msg, D extends Dom>(
  init: [S, Cmd.Cmd<M>],
  update: (msg: M, model: S) => [S, Cmd.Cmd<M>],
  view: (model: S) => Html.Html<D, M>,
  subscriptions: (model: S) => Sub.Sub<M>,
) => Html.Program<S, M, D> {
  return (init, update, view, subscriptions) =>
    createProgram(stopDebuggerOn, init, update, view, subscriptions)
}

/**
 * Same as `programWithDebugger()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @category constructors
 * @since 0.5.3
 */
export function ProgramWithFlags<Flags, Model, Msg, Dom>(
  init: (flags: Flags) => [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  view: (model: Model) => Html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): (flags: Flags) => Html.Program<Model, Msg, Dom> {
  return (flags) => Program(init(flags), update, view, subscriptions)
}

/**
 * Same as `programWithDebuggerWithStop()` but with `Flags` that can be passed when the `Program` is created in order to manage initial values.
 * @category constructors
 * @since 0.5.4
 */
export function ProgramWithFlagsWithStop<Model, Msg, Dom>(
  stopDebuggerOn: Rx.Observable<unknown>,
): <Flags, S extends Model, M extends Msg, D extends Dom>(
  init: (flags: Flags) => [S, Cmd.Cmd<M>],
  update: (msg: M, model: S) => [S, Cmd.Cmd<M>],
  view: (model: S) => Html.Html<D, M>,
  subscriptions: (model: S) => Sub.Sub<M>,
) => (flags: Flags) => Html.Program<S, M, D> {
  return (init, update, view, subscriptions) => (flags) =>
    createProgram(stopDebuggerOn, init(flags), update, view, subscriptions)
}

// --- Internal
function createProgram<Model, Msg, Dom>(
  stopDebuggerOn: Rx.Observable<unknown>,
  init: [Model, Cmd.Cmd<Msg>],
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>],
  view: (model: Model) => Html.Html<Dom, Msg>,
  subscriptions: (model: Model) => Sub.Sub<Msg>,
): Html.Program<Model, Msg, Dom> {
  const runDebugger = RunDebugger<Model, Msg>(window, stopDebuggerOn)

  const initModel = init[0]

  const debug$ = new Rx.BehaviorSubject<DebugData<Model, Msg>>([
    debugInit(),
    initModel,
  ])

  const debugId$ = new Rx.BehaviorSubject<string>("")

  const program = Html.Program(
    init,
    updateWithDebug<Model, Msg>({
      debug$,
      debugId$,
      update,
    }),
    view,
    (model): Sub.Sub<Msg> => {
      if (
        // @ts-ignore
        model[DEBUG_ID_KEY] === debugId$.value
      ) {
        return subscriptions(model)
      }

      // ignored subscriptions when time travel debugging

      return Sub.none
    },
  )

  // --- Run the debugger
  // --- we need to make a type assertion for `dispatch` because we cannot change the intrinsic `msg` type of `program`;
  // --- otherwise `programWithDebugger` won't be usable as a transparent extension/substitution of `Html`'s programs
  runDebugger({
    debug$,
    init: initModel,
    dispatch: program.dispatch as DebuggerR<Model, Msg>["dispatch"],
  })()

  return program
}

export function run<Model, Msg, Dom>(
  program: Html.Program<Model, Msg, Dom>,
  renderer: Html.Renderer<Dom>,
): Rx.Observable<Model> {
  const model$ = new Rx.Subject<Model>()

  // why?
  // wait for redux devtools debugger to start before running program
  // because messages were being dispatched before the dev tools started
  // resulting in initial messages not being logged
  //
  // todo: actually subscribe to the redux dev tools start message instead of using a timeout
  setTimeout(() => {
    Html.run(program, renderer).subscribe((model) => {
      model$.next(model)
    })
  }, 100)

  return model$
}
