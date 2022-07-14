import * as Frontend from "Frontend";
import * as ReactDomClient from "react-dom/client";
import { Browser, Debug, pipe } from "Core";

//
//
//
// Program
//
//
//

const program = pipe(
  Browser.application({
    init: Frontend.init,
    onLocationChange: Frontend.onLocationChange,
    subscriptions: Frontend.subscriptions,
    update: Frontend.update,
    view: Frontend.view,
  }),
  Debug.ReduxDevTools.withDebugger,
);

//
//
//
// Run
//
//
//

const root = ReactDomClient.createRoot(document.getElementById("root")!);

Browser.run(program, (dom) => {
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
