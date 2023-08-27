import {
  Browser,
  Program,
  createTransportClient,
  toMsgPayload,
  toMsgType,
} from "gamezilla/@SHARED/core";
import * as AppClient from "./app/app.client";
import "./main.css";
import { render } from "preact";

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

program.subscribe((model, ctx) => {
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

program.subscribe((model, _ctx, msg) => {
  if (msg) {
    console.log([toMsgType(msg), toMsgPayload(msg, {})]);
  }
  // @ts-ignore
  window.model = model;
});

program.start();
