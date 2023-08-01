import {
  AppClient,
  ClientToServerEvents,
  ServerToClientEvents,
  ToServer,
  serverPort,
  sessionIdKey,
} from "@gamezilla/app";
import {
  Browser,
  Cmd,
  ProgramV2,
  toMsgPayload,
  toMsgType,
} from "@gamezilla/core";
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

  const program = ProgramV2.create({
    init: () => {
      return AppClient.init({ location: Browser.getLocation() });
    },
    update: (input) => {
      return AppClient.update({
        now: input.ctx.now,
        model: input.model,
        msg: input.msg,
        sendToServer,
      });
    },
    subscriptions: (input) => {
      return AppClient.subscriptions({
        now: input.ctx.now,
        model: input.model,
      });
    },
  });

  program.subscribe(async function (model, ctx, msg) {
    if (msg) {
      console.group("update");
      console.log(toMsgType(msg), toMsgPayload(msg, {}));
      console.log(model);
      console.groupEnd();
    } else {
      console.log(model);
    }
    root.render(
      <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />
    );
  });

  program.start();
};

//
//
//
//
//
//
//
//
//
//
//

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
