import { Browser, Ctx, Program } from "gamezilla/@SHARED/core";
import { render } from "preact";
import "preact/debug";
import * as AppClient from "./@CHILD/app/app.client";
import * as App from "./@CHILD/app/app.core";

const main = async () => {
  const program = await Program.create({
    init: (input) => {
      const init = AppClient.init({
        ...input,
        location: Browser.getLocation(),
        stored: null,
      });

      return init;
    },

    update: AppClient.update,

    subscriptions: AppClient.subscriptions,
  });

  function renderer(model: App.ClientModel, ctx: Ctx) {
    render(
      <AppClient.View
        dispatch={program.dispatch}
        model={model}
        now={ctx.now}
      />,
      document.body
    );
  }

  program.subscribe(renderer);
  program.start();
};

/**
 * Use this to persist state across page refreshes.
 * It retains type safety by using deployment IDs.
 */
export function Storage<TModel>() {
  const CODEBASE_VERSION_ID_KEY = "gamezilla/codebase-version-id";
  const MODEL_KEY = "gamezilla/model";

  return {
    get() {
      const storedId = sessionStorage.getItem(CODEBASE_VERSION_ID_KEY);

      if (storedId !== App.PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID) {
        return null;
      }

      const got = sessionStorage.getItem(MODEL_KEY);

      const maybeModel = got ? (JSON.parse(got) as TModel) : null;

      return maybeModel;
    },

    set(model: TModel) {
      sessionStorage.setItem(
        CODEBASE_VERSION_ID_KEY,
        App.PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID
      );
      sessionStorage.setItem(MODEL_KEY, JSON.stringify(model));
    },
  };
}

/**
 * Use this to render runtime errors to the screen.
 * This is useful for debugging on mobile devices.
 */
export function renderRuntimeErrors() {
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

main();
