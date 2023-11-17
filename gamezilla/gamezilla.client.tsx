import { Browser, Program } from "gamezilla/@SHARED/core";
import { render } from "preact";
import * as AppClient from "./@CHILD/app/app.client";
import { attachClientTransport } from "./@CHILD/app/wire";
import { attachDebugger } from "./@SHARED/core/debug";
import "./main.css";

const VITE_DEPLOYMENT_ID = import.meta.env["VITE_DEPLOYMENT_ID"] ?? null;

const sessionStorageKey = `model:${VITE_DEPLOYMENT_ID ?? ""}`;

console.log(
  "VITE_DEPLOYMENT_ID",
  VITE_DEPLOYMENT_ID,
  "sessionStorageKey",
  sessionStorageKey
);

const program = Program.create({
  init: (input) => {
    const storedRaw = sessionStorage.getItem(sessionStorageKey);
    const stored = storedRaw ? JSON.parse(storedRaw) : null;

    const init = AppClient.init({
      ctx: input.ctx,
      location: Browser.getLocation(),
      documentVisibilityState: Browser.getDocumentVisibilityState(),
      stored: stored,
    });

    return {
      model: stored ? stored : init.model,
      eff: init.eff,
    };
  },
  update: AppClient.update,
  subscriptions: AppClient.subscriptions,
});

program.subscribe((model, ctx) => {
  // @ts-ignore
  window.model = model;

  sessionStorage.setItem(sessionStorageKey, JSON.stringify(model));

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
