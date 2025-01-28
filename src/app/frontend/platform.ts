import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import type { PlatformCmd } from '../@/frontend/cmd'
import { pipe } from '~/@/function/pipe'
import { ScreenSize } from '../@/ui/screen/screen-size'

export type Model = {
  documentVisibilityState: DocumentVisibilityState
  screenSize: ScreenSize
}

export const init = (_input: {
  stored: Record<string, unknown> | null
}): {
  model: Model
} => {
  if (typeof window === 'undefined') {
    return { model: { documentVisibilityState: 'visible', screenSize: ScreenSize.get() } }
  }

  return {
    model: {
      documentVisibilityState: document.visibilityState,
      screenSize: ScreenSize.get(),
    },
  }
}

export type Msg =
  | { t: 'document-became-hidden' }
  | { t: 'document-became-visible' }
  | { t: 'screen-size-changed'; screenSize: ScreenSize }
  | { t: 'copied-to-clipboard'; text: string }
  | { t: 'element-focused'; id: string }

export const update = <TMsgFrontend>({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: PlatformCmd<TMsgFrontend> | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  parentEff?: Eff<TMsgFrontend>
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
    case 'document-became-hidden': {
      return {
        model: {
          ...model,
          documentVisibilityState: 'hidden',
        },
      }
    }

    case 'document-became-visible': {
      return {
        model: {
          ...model,
          documentVisibilityState: 'visible',
        },
      }
    }

    case 'element-focused': {
      return {
        model,
      }
    }

    case 'copied-to-clipboard': {
      return {
        model,
      }
    }

    case 'screen-size-changed': {
      return {
        model: {
          ...model,
          screenSize: msg.screenSize,
        },
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
    case 'focus': {
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
              element.removeEventListener('focus', handler)
              dispatch({
                t: 'element-focused',
                id: platformCmd.viewId,
              })
            }
            element.addEventListener('focus', handler)

            for (let i = 0; i < 10; i++) {
              element.focus()

              await new Promise((resolve) => resolve(null))

              if (focused) {
                break
              }
            }

            resolve(null)
          })
        },
      }
    }

    case 'start-timeout': {
      return {
        model,
        parentEff: Time.startTimeout(platformCmd.timeoutId, platformCmd.duration, platformCmd.msg),
      }
    }

    case 'cancel-timeout': {
      return {
        model,
        parentEff: Time.cancelTimeout(platformCmd.timeoutId),
      }
    }

    case 'copy-to-clipboard': {
      return {
        model,
        eff: async (dispatch) => {
          await navigator.clipboard.writeText(platformCmd.text)
          dispatch({
            t: 'copied-to-clipboard',
            text: platformCmd.text,
          })
        },
      }
    }
    default: {
      return {
        model,
      }
    }
  }
}

const visibilityStateSubscriptions: Sub<Msg> = Browser.onDocumentVisibilityState<Msg>((state) => {
  switch (state) {
    case 'hidden': {
      return {
        t: 'document-became-hidden',
      }
    }

    case 'visible': {
      return {
        t: 'document-became-visible',
      }
    }
  }
})

const screenSizeSubscriptions: Sub<Msg> = pipe(
  Browser.onWindowResize<Msg>(({ width }) => ({ t: 'screen-size-changed', screenSize: ScreenSize.to(width) })),
  (sub) => Sub.deduplicate('screen-size', (msg) => (msg.t === 'screen-size-changed' ? msg.screenSize : 'mobile'), sub),
)

export const subscriptions: Sub<Msg> = Sub.batch([visibilityStateSubscriptions, screenSizeSubscriptions])
