import {
  AppClient,
  ClientModel,
  ClientMsg,
  ClientToServerEvents,
  ServerToClientEvents,
  ToServer,
  serverPort,
  sessionIdKey,
} from "@gamezilla/app";
import {
  Browser,
  Cmd,
  Debug,
  Posix,
  Program,
  toMsgPayload,
  toMsgType,
} from "@gamezilla/core";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { Subscription } from "rxjs";
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
  useNgrok: false,
};

const main = () => {
  const serverUrl = env.isProd
    ? "https://server.gamezilla.app/"
    : env.useNgrok
    ? "https://gamezilla-server.ngrok.io/"
    : `http://localhost:${serverPort}/`;

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
      socketClient.emit("to-server", msg);
    };

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  if (false) {
    const program = Program.create({
      init: AppClient.init({ location: Browser.getLocation() }),
      update: (input) =>
        AppClient.update({
          ...input,
          sendToServer,
        }),
      subscriptions: AppClient.subscriptions,
    });

    const attached = Debug.ReduxDevTools.withDebugger(program);

    Program.run(attached.program);

    attached.program.state$.subscribe((state) => {
      root.render(
        <StrictMode>
          <AppClient.View
            now={state.model._now}
            model={state.model}
            dispatch={attached.program.dispatch}
          />
        </StrictMode>
      );
    });
    return;
  }

  type State = { model: ClientModel; cmd?: Cmd<ClientMsg> };

  let state: State = AppClient.init({ location: Browser.getLocation() });

  let subscribed: Subscription | null = null;

  function dispatch(msg: ClientMsg) {
    const now = Posix.fromNumber(Date.now());

    const updated = AppClient.update({
      now,
      model: state.model,
      msg,
      sendToServer,
    });

    console.log(toMsgType(msg));
    console.log(toMsgPayload(msg, {}));

    setState(now, updated);
  }

  function setState(now: Posix, stateNew: State) {
    root.render(
      <StrictMode>
        <AppClient.View now={now} model={stateNew.model} dispatch={dispatch} />
      </StrictMode>
    );

    if (subscribed) {
      subscribed.unsubscribe();
    }

    subscribed = AppClient.subscriptions({
      now,
      model: stateNew.model,
    }).subscribe(dispatch);

    if (stateNew.cmd) {
      stateNew.cmd(dispatch);
    }

    state = stateNew;
  }

  setState(Posix.fromNumber(Date.now()), state);
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
