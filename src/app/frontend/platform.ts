import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import type { PlatformCmd } from '../@/frontend/cmd'
import { ScreenSizeFrontend } from './screen-size'

export type Model = {
  documentVisibilityState: DocumentVisibilityState
  screenSize: ScreenSizeFrontend.Model
}

export const init = (_input: { stored: Record<string, unknown> | null }): { model: Model } => {
  return {
    model: {
      documentVisibilityState: typeof window === 'undefined' ? 'visible' : document.visibilityState,
      screenSize: ScreenSizeFrontend.init().model,
    },
  }
}

export type Msg =
  | { t: 'got-screen-size-msg'; c: ScreenSizeFrontend.Msg }
  | { t: 'document-became-hidden' }
  | { t: 'document-became-visible' }
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
  if (!msg) return { model }

  switch (msg.t) {
    case 'document-became-hidden': {
      return { model: { ...model, documentVisibilityState: 'hidden' } }
    }

    case 'document-became-visible': {
      return { model: { ...model, documentVisibilityState: 'visible' } }
    }

    case 'element-focused': {
      return { model }
    }

    case 'copied-to-clipboard': {
      return { model }
    }

    case 'got-screen-size-msg': {
      const updated = ScreenSizeFrontend.update({ msg: msg.c, model: model.screenSize })
      return { model: { ...model, screenSize: updated.model } }
    }
  }
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) return { model }

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

export const subscriptions: Sub<Msg> = Sub.batch([
  visibilityStateSubscriptions,
  Sub.tag('got-screen-size-msg', ScreenSizeFrontend.subscriptions),
])
