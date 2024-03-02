import { Browser, Eff, Sub, Time } from "gamezilla/@SHARED/core"
import { PlatformCmd } from "../@SHARED/client"

export type Model = {
  documentVisibilityState: DocumentVisibilityState
}

export const init = ({
  stored,
}: {
  stored: Model | null
}): {
  model: Model
} => {
  if (stored) {
    return {
      model: stored,
    }
  }
  return {
    model: {
      documentVisibilityState: document.visibilityState,
    },
  }
}

export type Msg =
  | { t: "document-became-hidden" }
  | { t: "document-became-visible" }
  | { t: "element-focused"; id: string }

export const update = <TMsgClient>({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: PlatformCmd<TMsgClient> | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  parentEff?: Eff<TMsgClient>
  eff?: Eff<Msg>
} => {
  if (msg) {
    return updateFromMsg({ msg, model })
  }

  if (msgCmd) {
    return updateFromCmd({ msgCmd, model })
  }

  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) {
    return { model }
  }
  switch (msg.t) {
    case "document-became-hidden": {
      return {
        model: { ...model, documentVisibilityState: "hidden" },
      }
    }

    case "document-became-visible": {
      return {
        model: { ...model, documentVisibilityState: "visible" },
      }
    }

    case "element-focused": {
      return {
        model,
      }
    }
  }
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) {
    return { model }
  }

  const platformCmd = msgCmd.c

  switch (platformCmd.t) {
    case "focus": {
      return {
        model,
        eff: async (dispatch) => {
          const element = document.getElementById(platformCmd.viewId)

          if (!element) {
            return
          }

          await new Promise<null>(async (resolve) => {
            let focused = false
            const handler = () => {
              focused = true
              element.removeEventListener("focus", handler)
              dispatch({
                t: "element-focused",
                id: platformCmd.viewId,
              })
            }
            element.addEventListener("focus", handler)

            for (let i = 0; i < 10; i++) {
              element.focus()

              await new Promise((resolve) => setTimeout(resolve, 500))
              if (focused) {
                break
              }
            }

            resolve(null)
          })
        },
      }
    }

    case "start-timeout": {
      return {
        model,
        parentEff: Time.startTimeout(
          platformCmd.timeoutId,
          platformCmd.duration,
          platformCmd.msg,
        ),
      }
    }

    case "cancel-timeout": {
      return {
        model,
        parentEff: Time.cancelTimeout(platformCmd.timeoutId),
      }
    }

    default: {
      return {
        model,
      }
    }
  }
}

export const subscriptions: Sub<Msg> = Browser.onDocumentVisibilityState<Msg>(
  (state) => {
    switch (state) {
      case "hidden": {
        return { t: "document-became-hidden" }
      }

      case "visible": {
        return { t: "document-became-visible" }
      }
    }
  },
)
