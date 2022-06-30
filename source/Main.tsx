import * as ReactDomClient from "react-dom/client"
import * as Rx from "rxjs"
import { Browser, Option } from "Core"
import { useEffect } from "react"
import * as App from "./App"

//
//
//
// Helpers
//
//
//

const getReactRoot = () => {
  const htmlRoot = document.getElementById("root")

  if (!htmlRoot) {
    throw new Error("#root element is missing from the html document")
  }

  if (import.meta.hot) {
    const reactRoot: ReactDomClient.Root =
      import.meta.hot.data["reactRoot"] ?? ReactDomClient.createRoot(htmlRoot)

    import.meta.hot.data["reactRoot"] = reactRoot

    return reactRoot
  }

  return ReactDomClient.createRoot(htmlRoot)
}

//
//
//
// program
//
//
//

const state$ = new Rx.BehaviorSubject(App.init(Browser.history.location))

const dispatch = (msg: App.Msg) => {
  console.log("[app]", msg.type)

  state$.next(App.update(msg, state$.getValue()[0]))
}

//
//
//
// run program
//
//
//

const reactRoot = getReactRoot()

const CleanupComponent = () => {
  useEffect(() => {
    console.log("[component] mount")
    return () => {
      console.log("[component] unmount")
      cleanup()
    }
  }, [])
  return <div></div>
}

const viewSub = state$.subscribe((state) => {
  reactRoot.render(
    <>
      {App.view(state[0])(dispatch)}

      <CleanupComponent />
    </>,
  )
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

const cleanup = () => {
  subSub.unsubscribe()
  cmdSub.unsubscribe()
  viewSub.unsubscribe()
  // state$.unsubscribe()
}

//
//
//
// HMR clean up
//
//
//

type HotEvent =
  | "vite:beforeUpdate"
  | "vite:beforeFullReload"
  | "vite:beforePrune"
  | "vite:error"

if (import.meta.hot) {
  const fallback = state$.getValue()

  const initialState = import.meta.hot.data["initialState"] ?? fallback

  state$.next(initialState)

  console.log("[app] initialized state")

  const initialStateSub = state$.subscribe((state) => {
    if (import.meta.hot) {
      import.meta.hot.data["initialState"] = state
    }
  })

  import.meta.hot.accept()

  import.meta.hot.dispose(() => {
    initialStateSub.unsubscribe()
    cleanup()
    console.log("[app] cleaned up")
  })
}
