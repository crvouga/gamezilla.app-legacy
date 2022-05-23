import * as App from "App";
import { createRoot } from "react-dom/client";
import { react } from "./Framework";
import { programWithDebugger } from "./Framework/Debug/Navigation";

//
//
//
// Main
//
//
//

const program = programWithDebugger(
  App.locationToMsg,
  App.init,
  App.update,
  App.view,
  App.subscriptions
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root dom node");
}

const root = createRoot(rootElement);

react.run(program, (dom) => {
  root.render(dom);
});
