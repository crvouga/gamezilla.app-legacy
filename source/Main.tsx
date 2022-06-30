import * as ReactDomClient from "react-dom/client"
import * as Rx from "rxjs"
import { Browser, Cmd, Option } from "Core"
import {
  DebugAction,
  DebugData,
  DebuggerDeps,
  debugInit,
  debugMsg,
} from "Core/Debug/debugger-commons"
import * as App from "./App"
import * as ReduxDevTools from "./Core/Debug/ReduxDevTools"

//
//
//
// Helpers
//
//
//

const getHotData = <T,>(key: string, fallback: () => T): T => {
  if (import.meta.hot) {
    const value = import.meta.hot.data[key] ?? fallback()

    import.meta.hot.data[key] = value

    return value
  }

  return fallback()
}

//
//
//
// React
//
//
//

const getReactDomRoot = () => {
  const htmlRoot = document.getElementById("root")

  if (!htmlRoot) {
    throw new Error("#root element is missing from the html document")
  }

  if (import.meta.hot) {
    const reactDomRoot: ReactDomClient.Root =
      import.meta.hot.data["reactDomRoot"] ??
      ReactDomClient.createRoot(htmlRoot)

    import.meta.hot.data["reactDomRoot"] = reactDomRoot

    return reactDomRoot
  }

  return ReactDomClient.createRoot(htmlRoot)
}

const reactDomRoot = getReactDomRoot()

//
//
//
// program
//
//
//

const state$ = new Rx.BehaviorSubject(App.init(Browser.history.location))

const debug$ = new Rx.BehaviorSubject<DebugData<App.Model, App.Msg>>([
  debugInit(),
  state$.getValue()[0],
])

const dispatch: DebuggerDeps<App.Model, App.Msg>["dispatch"] = (msg) => {
  switch (msg.type) {
    case "__DebugApplyMsg__":
      state$.next(App.update(msg.payload, state$.getValue()[0]))
      return

    case "__DebugUpdateModel__":
      state$.next([msg.payload, Cmd.None])
      return

    default:
      const [modelNew, cmdNew] = App.update(msg, state$.getValue()[0])
      state$.next([modelNew, cmdNew])
      debug$.next([debugMsg(msg), modelNew])
      return
  }
}

//
//
//
// run program
//
//
//

const viewSub = state$.subscribe((state) => {
  reactDomRoot.render(App.view(state[0])(dispatch))
})

const subSub = state$
  .pipe(Rx.switchMap((state) => App.subscriptions(state[0])))
  .subscribe(dispatch)

const cmdSub = state$
  .pipe(
    Rx.map((state) => state[1]),
    Rx.mergeAll(),
  )
  .subscribe((task) => task().then(Option.map(dispatch)))

console.log("[app] started")

//
//
//
// Hot Reload
//
//
//

if (import.meta.hot) {
  //
  //
  // App State
  //
  //

  const initialState = import.meta.hot.data["initialState"] ?? state$.getValue()

  state$.next(initialState)

  console.log("[app] initialized state")

  const initialStateSub = state$.subscribe((state) => {
    if (import.meta.hot) {
      import.meta.hot.data["initialState"] = state
    }
  })

  //
  //
  //
  //
  //

  const initialDebug = import.meta.hot.data["initialDebug"] ?? debug$.getValue()

  debug$.next(initialDebug)

  const initialDebugSub = debug$.subscribe((debug) => {
    if (import.meta.hot) {
      import.meta.hot.data["initialDebug"] = debug
    }
  })

  const maybeConnection = getHotData("devToolsConnection", () =>
    ReduxDevTools.getConnection<App.Model, App.Msg>(window),
  )

  if (maybeConnection.type === "None") {
    throw new Error("")
  }

  const connection = maybeConnection.value

  const debuggerInstance = ReduxDevTools.makeDebugger(connection)({
    debug$,
    dispatch,
    init: debug$.getValue()[1],
  })

  const debugSub = debug$.subscribe({
    next: debuggerInstance.debug,
    complete: debuggerInstance.stop,
  })

  console.log("[debugger] started")

  //
  //
  //
  //
  //

  import.meta.hot.accept()

  import.meta.hot.dispose(() => {
    initialStateSub.unsubscribe()
    subSub.unsubscribe()
    cmdSub.unsubscribe()
    viewSub.unsubscribe()
    initialDebugSub.unsubscribe()
    debugSub.unsubscribe()
    console.log("[hmr] cleaned up")
  })
}
