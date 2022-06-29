import * as ReactDomClient from "react-dom/client"
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
  if (!import.meta.hot) {
    return
  }

  import.meta.hot.accept()

  const program = Debug.Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    view: App.view,
    subscriptions: App.subscriptions,
  })

  const appState = getData("appState", () => program.state$.getValue())

  program.state$.next(appState)

  program.state$.subscribe((state) => {
    setData("appState", state)
  })

  const rootNode = document.getElementById("root")

  if (rootNode === null) {
    throw new Error("root node is missing from document")
  }

  const reactRoot = getData("reactRoot", () =>
    ReactDomClient.createRoot(rootNode),
  )

  await program.startDebugger()

  Browser.run(program, (dom) => {
    reactRoot.render(dom)
  })

  console.log(import.meta.hot.data)
}
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

development()
