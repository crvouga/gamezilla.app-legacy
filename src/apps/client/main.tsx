import { AppClient } from "@gamezilla/app";
import { Browser, Program, toMsgPayload, toMsgType } from "@gamezilla/core";
import { render } from "inferno";
import "./main.css";
import { createTransportClient } from "./transport-client";

const env = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  useNgrok: false,
};

const serverUrl = env.isProd
  ? "https://server.gamezilla.app/"
  : env.useNgrok
  ? "https://gamezilla-server.ngrok.io/"
  : `http://localhost:${5000}/`;

const transport = createTransportClient({
  baseServerUrl: serverUrl,
  onServerMsg: AppClient.onServerMsg,
  onWireMsg: AppClient.onWireMsg,
});

const program = Program.create({
  init: () => {
    return AppClient.init({ location: Browser.getLocation() });
  },
  update: (input) => {
    return AppClient.update({
      now: input.ctx.now,
      model: input.model,
      msg: input.msg,
      sendToServer: transport.sendToServer,
    });
  },
  subscriptions: (input) => {
    return AppClient.subscriptions({
      now: input.ctx.now,
      model: input.model,
    });
  },
});

const debug = false;
program.subscribe(async function (model, ctx, msg) {
  if (debug && msg) {
    console.log(toMsgType(msg), toMsgPayload(msg, {}));
  }
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

program.start();
