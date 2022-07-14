import * as Frontend from "Frontend";
import * as ReactDomClient from "react-dom/client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  backendServerPort,
  bridge$,
} from "Bridge";
import { Browser, Debug, pipe } from "Core";
import { ToFrontend } from "Types";
import { Socket, io } from "socket.io-client";

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
// Talking to Backend
//
//
//

const productionBackendUrl = "https://gamezilla.herokuapp.com/";

const developmentBackendUrl = `http://localhost:${backendServerPort}/`;

const backendUrl =
  process.env.NODE_ENV === "production"
    ? productionBackendUrl
    : developmentBackendUrl;

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(backendUrl);

socket.on("ToFrontend", (msg) => {
  program.dispatch(["FromBackend", msg]);
});

bridge$.toBackend.subscribe((msg) => {
  socket.emit("ToBackend", msg);
});

bridge$.toFrontend.subscribe((msg) => {
  console.error("Can not send message to the frontend from the frontend", msg);
});

bridge$.connectionStatus.next("Connecting");
socket.on("connect", () => {
  bridge$.connectionStatus.next("Connected");
});
socket.on("connect_error", () => {
  bridge$.connectionStatus.next("Reconnecting");
});
socket.on("disconnect", () => {
  bridge$.connectionStatus.next("Disconnected");
});

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
