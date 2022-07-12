import * as App from "App";
import * as ReactDomClient from "react-dom/client";
import { Browser, Debug, Fullstack } from "Core";

//
//
//
// Main
//
//
//

const program = Debug.ReduxDevTools.withDebugger(
  Fullstack.frontend({
    backendUrl: "http://localhost:5000/",
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    updateFromBackend: App.updateFromBackend,
    subscriptions: App.subscriptions,
    view: App.view,
  }),
);

const container = document.getElementById("root");

const root = ReactDomClient.createRoot(container!);

const stop = Browser.run(program, (dom) => {
  root.render(dom);
});

//
//
//
// Hot Reload
//
//
//

// const dispose = () => {
//   stop();
// };

// // @ts-ignore
// if (import.meta.hot) {
//   // @ts-ignore
//   import.meta.hot.accept();
//   // @ts-ignore
//   import.meta.hot.dispose(dispose);
// }
