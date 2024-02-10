import { PUBLIC_APP_CONFIG, RendererImpl } from "config.ts"
import { Browser, Posix, Program } from "gamezilla/@SHARED/core"
import * as AppClient from "./@CHILD/app/app.client"
import * as App from "./@CHILD/app/app.core"
import { attachDebuggerBrowserExtension } from "./@SHARED/core/debug"

type Ctx = {
  now: Posix
}

const main = async () => {
  const renderer = await getRenderer({
    impl: PUBLIC_APP_CONFIG.RENDERER_IMPL,
  })

  const deps = AppClient.getDeps()

  const program = Program.create<App.ModelClient, App.MsgClient, Ctx>({
    getCtx: () => {
      return {
        now: Posix.now(),
      }
    },
    init: (input) => {
      const init = AppClient.init({
        deps,
        ctx: input.ctx,
        location: Browser.getLocation(),
        stored: null,
      })

      return init
    },

    update: (input) => {
      return AppClient.update({ ...input, deps })
    },

    subscriptions: (input) => {
      return AppClient.subscriptions({ ...input, deps })
    },

    onCrash: (e) => {
      console.error("Crashed!", e)
    },
  })

  program.subscribe(renderer(program.dispatch))

  await program.start()

  if (PUBLIC_APP_CONFIG.SHOULD_USE_DEBUGGER) {
    attachDebuggerBrowserExtension(program)
  }

  console.log(`Renderer: ${PUBLIC_APP_CONFIG.RENDERER_IMPL}`)
  console.log(`Transport: ${PUBLIC_APP_CONFIG.TRANSPORT_IMPL}`)
}

const DebuggerToggleStorage = () => {
  const KEY = "gamezilla/should-use-debugger"
  return {
    get() {
      const stored = sessionStorage.getItem(KEY)

      return stored === "true"
    },

    set(value: boolean) {
      sessionStorage.setItem(KEY, value.toString())
    },

    toggle() {
      const current = this.get()

      this.set(!current)
    },
  }
}

DebuggerToggleStorage()

/**
 * Use this to persist state across page refreshes.
 * It retains type safety by using deployment IDs.
 */
const Storage = <TModel,>() => {
  const CODEBASE_VERSION_ID_KEY = "gamezilla/codebase-version-id"
  const MODEL_KEY = "gamezilla/model"

  return {
    get() {
      const storedId = sessionStorage.getItem(CODEBASE_VERSION_ID_KEY)

      if (storedId !== PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID) {
        return null
      }

      const got = sessionStorage.getItem(MODEL_KEY)

      const maybeModel = got ? (JSON.parse(got) as TModel) : null

      return maybeModel
    },

    set(model: TModel) {
      sessionStorage.setItem(
        CODEBASE_VERSION_ID_KEY,
        PUBLIC_APP_CONFIG.CODEBASE_VERSION_ID,
      )
      sessionStorage.setItem(MODEL_KEY, JSON.stringify(model))
    },
  }
}

Storage()

/**
 * Use this to render runtime errors to the screen.
 * This is useful for debugging on mobile devices.
 */
const renderRuntimeErrors = () => {
  window.onerror = function (errorMsg, url, lineNumber, column, _errorObj) {
    showError(errorMsg, url, lineNumber, column)
  }

  window.addEventListener("unhandledrejection", function (msgEvt) {
    showError(msgEvt.reason.toString())
  })

  function showError(errorMsg: any, url?: any, lineNumber?: any, column?: any) {
    var errorDiv = document.createElement("div")
    errorDiv.style.color = "red"
    errorDiv.style.position = "fixed"
    errorDiv.style.top = "0"
    errorDiv.style.left = "0"
    errorDiv.style.backgroundColor = "white"
    errorDiv.innerHTML =
      "Error: " +
      errorMsg +
      (url ? " - at " + url + ": " + lineNumber + ":" + column : "")
    document.body.appendChild(errorDiv)
  }
}
renderRuntimeErrors()

type Renderer = (
  dispatch: (m: App.MsgClient) => void,
) => (model: App.ModelClient, ctx: Ctx) => void

const getRenderer = async ({
  impl,
}: {
  impl: RendererImpl
}): Promise<Renderer> => {
  const rootNode = document.getElementById("root")!

  switch (impl) {
    case "inferno": {
      const { render } = await import("inferno")

      return function renderer(dispatch) {
        return function renderInferno(model, ctx) {
          render(
            <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />,
            rootNode,
          )
        }
      }
    }

    case "react-with-million":
    case "react": {
      const { createRoot } = await import("react-dom/client")
      await import("react")

      const reactRoot = createRoot(rootNode)

      return function renderer(dispatch) {
        return function renderReact(model, ctx) {
          reactRoot.render(
            // @ts-ignore
            <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />,
          )
        }
      }
    }

    case "preact": {
      const { render } = await import("preact")
      await import("preact/compat")

      return function renderer(dispatch) {
        return function renderPreact(model, ctx) {
          render(
            <AppClient.View dispatch={dispatch} model={model} now={ctx.now} />,
            rootNode,
          )
        }
      }
    }
  }
}

main()
