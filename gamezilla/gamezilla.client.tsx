import {
  Browser,
  Program,
  attachClientTransport,
} from "gamezilla/@SHARED/core";
import { render } from "preact";
import { attachDebugger } from "./@SHARED/core/debug";
import * as AppClient from "./app/app.client";
import "./main.css";

//
//
//
//
//
//

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
  render(
    <AppClient.View now={ctx.now} model={model} dispatch={program.dispatch} />,
    document.body
  );
});

//
//
//
//

const main = async () => {
  await Promise.race([
    attachDebugger(program),
    new Promise((r) => setTimeout(r, 2000)),
  ]);

  program.start();

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

  attachClientTransport({
    baseServerUrl: serverUrl,
    wire: AppClient.wire,
    fromServer: AppClient.fromServer,
    toServer: AppClient.toServer,
  });
};

main();
