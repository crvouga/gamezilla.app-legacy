import * as ReactDomClient from "react-dom/client"
import * as Rx from "rxjs"
import { Browser, Option } from "Core"
import * as App from "./App"

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
    subSub.unsubscribe()
    cmdSub.unsubscribe()
    viewSub.unsubscribe()
    console.log("[hmr] cleaned up")
  })
}
