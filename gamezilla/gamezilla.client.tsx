import * as config from "config.ts";
import { Browser, Posix, Program } from "gamezilla/@SHARED/core";
import * as AppClient from "./@CHILD/app/app.client";
import * as App from "./@CHILD/app/app.core";
import { attachDebuggerBrowserExtension } from "./@SHARED/core/debug";

type Ctx = {
  now: Posix;
};

async function main() {
  const renderer = await getRenderer();

  const deps = AppClient.getDeps();

  const program = Program.create<App.ClientModel, App.ClientMsg, Ctx>({
    getCtx() {
      return {
        now: Posix.now(),
      };
    },
    init: (input) => {
      const init = AppClient.init({
        deps,
        ctx: input.ctx,
        location: Browser.getLocation(),
        stored: null,
      });

      return init;
    },

    update: (input) => AppClient.update({ ...input, deps }),

    subscriptions: (input) => AppClient.subscriptions({ ...input, deps }),
  });

  program.subscribe(renderer(program.dispatch));

  await program.start();

  const SHOULD_USE_DEBUGGER = false
  if (SHOULD_USE_DEBUGGER) {
    attachDebuggerBrowserExtension(program);
  }
}

main();

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

type Renderer = (
  dispatch: (m: App.ClientMsg) => void
) => (model: App.ClientModel, ctx: Ctx) => void;

async function getRenderer(): Promise<Renderer> {
  const rootNode = document.getElementById("root")!;
  console.log(`renderer: ${config.renderer}`);

  switch (config.renderer) {
    case "inferno": {
      const { render } = await import("inferno");

      return (dispatch) => (model, ctx) => {
        render(
          <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />,
          rootNode
        );
      };
    }

    case "react": {
      const { createRoot } = await import("react-dom/client");
      await import("react");

      const reactRoot = createRoot(rootNode);

      return (dispatch) => (model, ctx) => {
        reactRoot.render(
          <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />
        );
      };
    }

    case "preact": {
      const { render } = await import("preact");
      await import("preact/compat");

      return (dispatch) => (model, ctx) => {
        render(
          <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />,
          rootNode
        );
      };
    }
  }
}
