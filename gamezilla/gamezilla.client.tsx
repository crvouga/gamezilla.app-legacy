import { Browser, Program } from "gamezilla/@SHARED/core";
import { render } from "preact";
import * as AppClient from "./@CHILD/app/app.client";
import { attachDebugger } from "./@SHARED/core/debug";
import "./main.css";

const VITE_DEPLOYMENT_ID = import.meta.env["VITE_DEPLOYMENT_ID"] ?? null;

const sessionStorageKey = `model:${VITE_DEPLOYMENT_ID ?? ""}`;
const storedJson = sessionStorage.getItem(sessionStorageKey);
const stored = storedJson ? JSON.parse(storedJson) : null;

console.log(
  "VITE_DEPLOYMENT_ID",
  VITE_DEPLOYMENT_ID,
  "sessionStorageKey",
  sessionStorageKey
);

const program = Program.create({
  init: (input) => {
    const init = AppClient.init({
      ctx: input.ctx,
      location: Browser.getLocation(),
      stored: stored,
    });

    return {
      model: init.model,
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

attachDebugger(program);

program.start();

//
//
//
//
//
//
//
//

function renderRuntimeErrors() {
  window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    showError(errorMsg, url, lineNumber, column);
  };

  window.addEventListener("unhandledrejection", function (event) {
    showError(event.reason.toString());
  });

  function showError(errorMsg: any, url?: any, lineNumber?: any, column?: any) {
    var errorDiv = document.createElement("div");
    errorDiv.style.color = "red";
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "0";
    errorDiv.style.left = "0";
    errorDiv.style.backgroundColor = "white";
    errorDiv.innerHTML =
      "Error: " +
      errorMsg +
      (url ? " - at " + url + ": " + lineNumber + ":" + column : "");
    document.body.appendChild(errorDiv);
  }
}
