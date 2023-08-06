import {
  AppClient,
  ClientToServerEvents,
  ServerToClientEvents,
  ToServer,
  serverPort,
  sessionIdKey,
} from "@gamezilla/app";
import { Browser, Cmd, Program } from "@gamezilla/core";
import { render } from "inferno";
import { Socket, io } from "socket.io-client";
import "./main.css";

const env = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  useNgrok: false,
};

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
  AppClient.wireMsgs.publish({ t: "connected" });
});

socketClient.on("disconnect", () => {
  AppClient.wireMsgs.publish({ t: "disconnected" });
});

socketClient.on("connect_error", () => {
  AppClient.wireMsgs.publish({ t: "connect-error" });
});

socketClient.on("to-client", (msg) => {
  AppClient.fromServerMsgs.publish(msg);
});

const sendToServer =
  (msg: ToServer): Cmd =>
  () => {
    socketClient.emit("to-server", msg);
  };

const program = Program.create({
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

program.subscribe(async function (model, ctx) {
  // if (msg) {
  //   console.log(toMsgType(msg), toMsgPayload(msg, {}));
  // }
  // console.log(model);
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

program.start();
