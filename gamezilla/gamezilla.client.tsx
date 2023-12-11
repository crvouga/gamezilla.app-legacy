import { Browser, Program } from "gamezilla/@SHARED/core";
import { render } from "preact";
import * as AppClient from "./@CHILD/app/app.client";
import * as App from "./@CHILD/app/app.core";
import { attachDebugger } from "./@SHARED/core/debug";

const modelStorage = ModelStorage<App.ClientModel>();

const main = async () => {
  const program = await Program.create({
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

  program.subscribe((model, ctx) => {
    render(
      <AppClient.View
        now={ctx.now}
        model={model}
        dispatch={program.dispatch}
      />,
      document.body
    );
  });

  program.subscribe((model) => {
    // @ts-ignore
    window.model = model;
  });

  program.subscribe((model) => {
    modelStorage.set(model);
  });

  attachDebugger(program);

  program.start();
};

main();

/**
 * Use this to persist state across page refreshes.
 * It retains type safety by using deployment IDs.
 */
function ModelStorage<TModel>() {
  const CODEBASE_VERSION_ID_KEY = "gamezilla/codebase-version-id";
  const MODEL_KEY = "gamezilla/model";
  const VITE_CODEBASE_VERSION_ID =
    import.meta.env["VITE_CODEBASE_VERSION_ID"] ?? null;

  return {
    get: () => {
      const storedId = sessionStorage.getItem(CODEBASE_VERSION_ID_KEY);

      if (storedId !== VITE_CODEBASE_VERSION_ID) {
        return null;
      }

      const got = sessionStorage.getItem(MODEL_KEY);

      const maybeModel = got ? (JSON.parse(got) as TModel) : null;

      return maybeModel;
    },

    set: (model: TModel) => {
      sessionStorage.setItem(CODEBASE_VERSION_ID_KEY, VITE_CODEBASE_VERSION_ID);
      sessionStorage.setItem(MODEL_KEY, JSON.stringify(model));
    },
  };
}

/**
 * Use this to render runtime errors to the screen.
 * This is useful for debugging on mobile devices.
 */
function renderRuntimeErrors() {
  window.onerror = function (errorMsg, url, lineNumber, column, _errorObj) {
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

renderRuntimeErrors();
