import * as ReactDomClient from "react-dom/client"
import * as Rx from "rxjs"
import { Browser, Cmd, Option, Sub } from "Core"
import {
  DebugAction,
  DebugData,
  DebuggerDeps,
  debugInit,
  debugMsg,
} from "Core/Debug/debugger-commons"
import { useEffect } from "react"
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

const setHotData = <T,>(key: string, value: T): void => {
  if (import.meta.hot) {
    import.meta.hot.data[key] = value
  }
}

const getDebugId = () => getHotData("debugId", () => 0)

const getNextDebugId = (): number => {
  const next = getHotData("debugId", () => 0) + 1

  setHotData("debugId", next)

  return next
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

const initial = App.init(Browser.history.location)

type Model = App.Model & { debugId: number }

const modelInit = { ...initial[0], debugId: getNextDebugId() }

const state$ = new Rx.BehaviorSubject<[Model, Cmd.Cmd<App.Msg>]>([
  modelInit,
  initial[1],
])

const debug$ = new Rx.BehaviorSubject<DebugData<Model, App.Msg>>([
  debugInit(),
  modelInit,
])

const dispatch: DebuggerDeps<Model, App.Msg>["dispatch"] = (msg) => {
  switch (msg.type) {
    case "__DebugApplyMsg__": {
      const stateNew = App.update(msg.payload, state$.getValue()[0])
      state$.next([{ ...stateNew[0], debugId: getNextDebugId() }, stateNew[1]])
      return
    }

    case "__DebugUpdateModel__":
      state$.next([msg.payload, Cmd.None])
      return

    default: {
      const stateNew = App.update(msg, state$.getValue()[0])
      const modelNew = { ...stateNew[0], debugId: getNextDebugId() }
      state$.next([modelNew, stateNew[1]])
      debug$.next([debugMsg(msg), modelNew])
      return
    }
  }
}

//
//
//
// run program
//
//
//

const CleanUp = () => {
  useEffect(() => {
    console.log("[app] mount")
    return () => {
      console.log("[app] unmount")
      cleanup()
    }
  }, [])
  return <div></div>
}

const viewSub = state$.subscribe((state) => {
  const dom = App.view(state[0])(dispatch)
  reactDomRoot.render(
    <>
      {dom}
      <CleanUp />
    </>,
  )
})

const subscriptions = (model: Model) => {
  if (model.debugId === getDebugId()) {
    return App.subscriptions(model)
  }

  console.log("[app] ignoring subscriptions when time traveling")

  return Sub.None
}

const subSub = state$
  .pipe(Rx.switchMap((state) => subscriptions(state[0])))
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

  const debuggerInstance = ReduxDevTools.makeDebugger<Model, App.Msg>(
    connection,
  )({
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
    initialDebugSub.unsubscribe()
    debugSub.unsubscribe()
    cleanup()
  })
}

const cleanup = () => {
  subSub.unsubscribe()
  cmdSub.unsubscribe()
  viewSub.unsubscribe()
  console.log("[hmr] cleaned up")
}
