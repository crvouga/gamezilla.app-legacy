import * as ReactDomClient from "react-dom/client"
import * as Rx from "rxjs"
import { Browser, Debug } from "Core"
import * as App from "./App"

//
//
//
//
//
//
//

const production = () => {
  const program = Debug.Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    view: App.view,
    subscriptions: App.subscriptions,
  })

  const rootNode = document.getElementById("root")

  if (!rootNode) {
    return
  }

  const reactRoot = ReactDomClient.createRoot(rootNode)

  Browser.run(program, (dom) => {
    reactRoot.render(dom)
  })
}

//
//
//
//
//
//
//

const development = async () => {
  console.info("[program] starting development mode")

  if (!import.meta.hot) {
    console.error("[program] failed to start development mode")

    return
  }

  import.meta.hot.accept()

  const isInitialLoad = getData("isInitialLoad", () => true)

  setData("isInitialLoad", false)

  const { startDebugger, ...rest } = Debug.Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    view: App.view,
    subscriptions: App.subscriptions,
  })

  const stopSignal = new Rx.Subject<unknown>()

  const program = Browser.withStop(stopSignal)(rest)

  const appState = getData("appState", () => program.state$.getValue())

  console.info("[program] preloading state...")

  program.state$.next(appState)

  program.state$.subscribe((state) => {
    setData("appState", state)
  })

  const rootNode = document.getElementById("root")

  if (rootNode === null) {
    console.error("[program] fail to get root dom node")
    return
  }

  const reactRoot = getData("reactRoot", () =>
    ReactDomClient.createRoot(rootNode),
  )

  if (isInitialLoad) {
    await startDebugger()
  }

  Browser.run(program, (dom) => {
    reactRoot.render(dom)
  })

  import.meta.hot.on("vite:beforeUpdate", () => {
    stopSignal.next("EMIT")
  })

  // console.dir(import.meta.hot.data)
}

//
//
//
// Utils
//
//
//

export const getData = <T,>(key: string, getFallback: () => T): T => {
  if (import.meta.hot) {
    const value = import.meta.hot.data[key] ?? getFallback()

    import.meta.hot.data[key] = value

    return value
  }

  return getFallback()
}

export const setData = <T,>(key: string, value: T): void => {
  if (import.meta.hot) {
    import.meta.hot.data[key] = value
  }
}

//
//
//
// Main
//
//
//

const main = (mode: "development" | "production") => {
  switch (mode) {
    case "development":
      development()
      return

    case "production":
      production()
      return
  }
}

main(import.meta.env.PROD ? "production" : "development")
