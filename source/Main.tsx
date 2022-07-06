import * as ReactDomClient from "react-dom/client";
import * as Socket from "socket.io-client";
import { Browser, Debug } from "Core";
import * as App from "./App";

//
//
//
// Main
//
//
//

const program = Debug.ReduxDevTools.withDebugger(
  Browser.application({
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

//
//
//
// Monitoring
//
//
//

program.state$.subscribe((state) => {
  const size = new TextEncoder().encode(JSON.stringify(state.model)).length;
  const kiloBytes = Math.round(size / 1024);
  // const megaBytes = kiloBytes / 1024;
  console.log(`[app] model memory size is ${kiloBytes} kiloBytes`);
});

//
//
//
// Backend Connection
//
//
//

const backendUrl = "http://localhost:5000/";

const socket = Socket.io(backendUrl);
console.log(socket);

socket.on("connect", () => {
  console.log("connected to backend");
});

//
//
//
// Hot Reload
//
//
//

// if (import.meta.hot) {
//   import.meta.hot.accept();
//   import.meta.hot.dispose(stop);
// }
