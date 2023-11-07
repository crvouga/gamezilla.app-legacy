import {
  Browser,
  Program,
  attachClientTransport,
} from "gamezilla/@SHARED/core";
import { render } from "preact";
import { attachDebugger } from "./@SHARED/core/debug";
import * as AppClient from "./@CHILD/app/app.client";
import "./main.css";

const program = Program.create({
  init: (input) => {
    return AppClient.init({
      ctx: input.ctx,
      location: Browser.getLocation(),
      documentVisibilityState: Browser.getDocumentVisibilityState(),
    });
  },
  update: (input) => {
    return AppClient.update({
      now: input.ctx.now,
      model: input.model,
      msg: input.msg,
    });
  },
  subscriptions: (input) => {
    return AppClient.subscriptions({ now: input.ctx.now, model: input.model });
  },
});

program.subscribe((model, ctx) => {
  // @ts-ignore
  window.model = model;
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

const SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "https://server.gamezilla.app/"
    : false
    ? "https://gamezilla-server.ngrok.io/"
    : `http://localhost:5000/`;

attachDebugger(program);

attachClientTransport({
  baseServerUrl: SERVER_URL,
  wire: AppClient.wire,
  fromServer: AppClient.fromServer,
  toServer: AppClient.toServer,
});

program.start();
