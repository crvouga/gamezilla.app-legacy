import { Browser, Program } from "gamezilla/@SHARED/core";
import { render } from "preact";
import * as AppClient from "./@CHILD/app/app.client";
import * as App from "./@CHILD/app/app.core";
import { attachDebugger } from "./@SHARED/core/debug";
import "./main.css";

const modelStorage = ModelStorage<App.ClientModel>();

const program = Program.create({
  init: (input) => {
    const init = AppClient.init({
      ...input,
      location: Browser.getLocation(),
      stored: modelStorage.get(),
    });

    return init;
  },

  update: (input) => {
    const updated = AppClient.update(input);

    return updated;
  },

  subscriptions: (input) => {
    const sub = AppClient.subscriptions(input);

    return sub;
  },
});

const root = document.getElementById("root");

if (root) {
  program.subscribe((model, ctx) => {
    modelStorage.set(model);

    render(
      <AppClient.View
        now={ctx.now}
        model={model}
        dispatch={program.dispatch}
      />,
      root
    );
  });
}

attachDebugger(program);

program.start();

/**
 * Use this to persist state across page refreshes.
 * It retains type safety by using deployment IDs.
 */
function ModelStorage<TModel>() {
  const DEPLOYMENT_ID_KEY = "gamezilla/deployment-id";
  const MODEL_KEY = "gamezilla/model";
  const VITE_DEPLOYMENT_ID = import.meta.env["VITE_DEPLOYMENT_ID"] ?? null;

  return {
    get: () => {
      const storedDeploymentId = sessionStorage.getItem(DEPLOYMENT_ID_KEY);

      if (storedDeploymentId !== VITE_DEPLOYMENT_ID) {
        return null;
      }

      const got = sessionStorage.getItem(MODEL_KEY);

      const maybeModel = got ? (JSON.parse(got) as TModel) : null;

      return maybeModel;
    },

    set: (model: TModel) => {
      sessionStorage.setItem(DEPLOYMENT_ID_KEY, VITE_DEPLOYMENT_ID);
      sessionStorage.setItem(MODEL_KEY, JSON.stringify(model));
    },
  };
}

/**
 * Use this to render runtime errors to the screen.
 * This is useful for debugging on mobile devices.
 */
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

// renderRuntimeErrors();
