import * as Rx from "rxjs"
import * as Option from "../Option"
import * as Task from "../Task"
import * as Console from "./debugger-console"
import * as ReduxDevtool from "./debugger-redux-devtool"
import { pipe } from "../pipe"
import { DebuggerDeps, Global } from "./debugger-commons"

/**
 * Checks which type of debugger can be used (standard `console` or _Redux DevTool Extension_) based on provided `window` and prepares the subscription to the "debug" stream
 *
 * **Warning:** this function **SHOULD** be considered as an internal method; using it in your application **SHOULD** be avoided.
 * @category utils
 * @since 0.5.4
 */
export const RunDebugger =
  <Model, Msg>(global: Global, stopSignal: Rx.Observable<unknown>) =>
  (deps: DebuggerDeps<Model, Msg>): Task.Task<void> => {
    return pipe(
      ReduxDevtool.getConnection<Model, Msg>(global),
      Task.map(
        Option.fold(
          () => Console.makeDebugger<Model, Msg>(),
          ReduxDevtool.makeDebugger,
        ),
      ),
      Task.chain((debuggerInstance) => async () => {
        const { debug, stop } = debuggerInstance(deps)

        deps.debug$.pipe(Rx.takeUntil(stopSignal)).subscribe({
          next: debug,
          complete: stop,
        })
      }),
    )
  }
