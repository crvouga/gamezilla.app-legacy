import * as ReactDomClient from "react-dom/client"
import { Browser, pipe } from "Core"
import * as App from "./App"
import * as ReduxDevTools from "./Core/Debug/ReduxDevTools"

//
//
//
// Main
//
//
//

const program = pipe(
  Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    subscriptions: App.subscriptions,
    view: App.view,
  }),
  ReduxDevTools.withDebugger,
)

const htmlRoot = document.getElementById("root")

if (!htmlRoot) {
  throw new Error("root node is missing from html document")
}

const reactDomRoot = ReactDomClient.createRoot(htmlRoot)

Browser.run(program, (dom) => {
  reactDomRoot.render(dom)
})
