import * as ReactDomClient from "react-dom/client"
import { Browser, Option, pipe } from "Core"
import * as App from "./App"
import * as ReduxDevTools from "./Core/Debug/ReduxDevTools"

//
//
//
// Main
//
//
//

const connection = getHotData("connection", () =>
  ReduxDevTools.getConnection<App.Model, App.Msg>(window),
)

const program = Browser.Application({
  onLocationChange: App.onLocationChange,
  init: App.init,
  update: App.update,
  subscriptions: App.subscriptions,
  view: App.view,
})

const programWithDebugger =
  connection.type === "None"
    ? program
    : ReduxDevTools.withDebugger(program, connection.value)

const container = document.getElementById("root")

const root = getHotData("root", () => ReactDomClient.createRoot(container!))

const stop = Browser.run(programWithDebugger, (dom) => {
  root.render(dom)
})

//
//
//
// HMR
//
//
//

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(stop)

  const initialState = getHotData("initialState", () =>
    program.state$.getValue(),
  )
  program.state$.next(initialState)
  program.state$.subscribe((state) => setHotData("initialState", state))
}

//
//
//
// Helpers
//
//
//

function setHotData<T>(key: string, value: T) {
  if (import.meta.hot) {
    import.meta.hot.data[key] = value
  }
}

function getHotData<T>(key: string, fallback: () => T): T {
  if (import.meta.hot) {
    const value = import.meta.hot.data[key] ?? fallback()

    import.meta.hot.data[key] = value

    return value
  }

  return fallback()
}
