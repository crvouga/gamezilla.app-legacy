import * as History from "history"
import * as Rx from "rxjs"
import * as Cmd from "../Cmd"
import * as Html from "../Html"
import * as Navigation from "../Navigation"
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
 * Adds a debugging capability to a generic `Navigation` `Program`.
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
 */
export const Program = <Model, Msg, Dom>({
  init,
  locationToMessage,
  subscriptions,
  update,
  view,
}: {
  locationToMessage: (location: Navigation.Location) => Msg
  init: (location: Navigation.Location) => [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Html.Program<Model, Msg, Dom> => {
  return createProgram({
    stopSignal: Rx.EMPTY,
    locationToMessage,
    init,
    update,
    view,
    subscriptions,
  })
}

const createProgram = <Model, Msg, Dom>({
  stopSignal,
  locationToMessage,
  init,
  subscriptions,
  update,
  view,
}: {
  stopSignal: Rx.Observable<unknown>
  locationToMessage: (location: Navigation.Location) => Msg
  init: (location: Navigation.Location) => [Model, Cmd.Cmd<Msg>]
  update: (msg: Msg, model: Model) => [Model, Cmd.Cmd<Msg>]
  view: (model: Model) => Html.Html<Dom, Msg>
  subscriptions: (model: Model) => Sub.Sub<Msg>
}): Html.Program<Model, Msg, Dom> => {
  const history = History.createBrowserHistory() // this is needed only to generate init model for debug$ :S

  const initModel = init(history.location)[0]

  const debug$ = new Rx.BehaviorSubject<DebugData<Model, Msg>>([
    debugInit(),
    initModel,
  ])
  const debugId$ = new Rx.BehaviorSubject<string | undefined>(undefined)

  const program = Navigation.Program({
    locationToMessage,
    init,
    update: updateWithDebug({
      update,
      debug$,
      debugId$,
    }),
    view,
    subscriptions: subscriptionsWithDebug({
      subscriptions,
      debugId$,
    }),
  })

  // --- Run the debugger
  // --- we need to make a type assertion for `dispatch` because we cannot change the intrinsic `msg` type of `program`;
  // --- otherwise `program` won't be usable as a transparent extension/substitution of `Html`'s programs
  const runDebugger = RunDebugger<Model, Msg>(window, stopSignal)

  runDebugger({
    debug$,
    init: initModel,
    dispatch: program.dispatch as DebuggerR<Model, Msg>["dispatch"],
  })()

  return program
}
