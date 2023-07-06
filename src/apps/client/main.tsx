import {
  AppClient,
  ClientToServerEvents,
  ServerToClientEvents,
  ToServer,
  serverPort,
  sessionIdKey,
} from "@gamezilla/app";
import { Browser, Cmd, Debug, Program } from "@gamezilla/shared/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Socket, io } from "socket.io-client";
import "./main.css";

//
//
//
// Main
//
//
//

const env = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};

const main = () => {
  const serverUrl = env.isProd
    ? "https://server.gamezilla.app/"
    : "https://gamezilla-server.ngrok.io";
  // `http://localhost:${serverPort}/`;

  const socketClient: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    serverUrl,
    {
      auth: {
        [sessionIdKey]: localStorage.getItem(sessionIdKey) ?? undefined,
      },
      forceNew: true,
    }
  );

  socketClient.on("session-id", (sessionId) => {
    console.log(`session-id: ${sessionId}`);
    localStorage.setItem(sessionIdKey, sessionId);
  });

  socketClient.on("connect", () => {
    AppClient.wireMsgs.next({ t: "connected" });
  });

  socketClient.on("disconnect", () => {
    AppClient.wireMsgs.next({ t: "disconnected" });
  });

  socketClient.on("connect_error", () => {
    AppClient.wireMsgs.next({ t: "connect-error" });
  });

  socketClient.on("to-client", (msg) => {
    AppClient.fromServerMsgs.next(msg);
  });

  const sendToServer =
    (msg: ToServer): Cmd =>
    () => {
      if (env.isDev) {
        setTimeout(() => {
          socketClient.emit("to-server", msg);
        }, 50 + 100 * Math.random());
        return;
      }

      socketClient.emit("to-server", msg);
    };

  const program = Program.create({
    init: AppClient.init({ location: Browser.getLocation() }),
    update: (input) => AppClient.update({ ...input, sendToServer }),
    subscriptions: AppClient.subscriptions,
  });

  const attached = Debug.ReduxDevTools.withDebugger(program);

  Program.run(attached.program);

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  Program.subscribe(program, (state) => {
    root.render(
      <React.StrictMode>
        <AppClient.View
          isTimeTravelDebugging={state.model._debugId < state.runningDebugId}
          now={state.model._now}
          model={state.model}
          $send={program.$send}
        />
      </React.StrictMode>
    );
  });
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (import.meta.hot) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!import.meta.hot.data?.["started"]) {
    console.log("[hot] starting app");
    main();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import.meta.hot.data["started"] = true;
  } else {
    console.log("[hot] reload");
  }
} else {
  main();
}
