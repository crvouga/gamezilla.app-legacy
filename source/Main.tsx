import * as ReactDomClient from "react-dom/client";
import { Browser, Option, pipe } from "Core";
import * as App from "./App";
import * as ReduxDevTools from "./Core/Debug/ReduxDevTools";

//
//
//
// Main
//
//
//

const program = ReduxDevTools.withDebugger(
  Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    subscriptions: App.subscriptions,
    view: App.view,
  }),
);

const container = document.getElementById("root");

const root = ReactDomClient.createRoot(container!);

Browser.run(program, (dom) => {
  root.render(dom);
});

program.state$.subscribe((state) => {
  const size = new TextEncoder().encode(JSON.stringify(state.model)).length;
  const kiloBytes = Math.round(size / 1024);
  // const megaBytes = kiloBytes / 1024;

  console.log(`[app] model memory size is ${kiloBytes} kiloBytes`);
});
