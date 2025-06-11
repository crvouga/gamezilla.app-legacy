import { Eff } from '~/@/eff'
import { sleep } from '~/@/promise/sleep'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { FocusViewCmd } from '~/app/@/frontend/focus-view-cmd.$msg'

export type Model = {
  t: 'noop'
}

export const init = (): { model: Model } => {
  return {
    model: {
      t: 'noop',
    },
  }
}

export type Msg = { t: 'element-focused'; id: string }

export const update = ({
  msg,
  model,
  msgIn,
}: {
  msgIn?: unknown | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg) return updateFromMsg({ msg, model })

  if (msgIn) return updateFromCmd({ msgIn, model })

  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) return { model }

  switch (msg.t) {
    case 'element-focused': {
      return { model }
    }
  }
}

const updateFromCmd: typeof update = ({ msgIn, model }) => {
  if (FocusViewCmd.is(msgIn)) {
    return {
      model,
      eff: async (dispatch) => {
        const element = document.getElementById(msgIn.viewId)

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
              id: msgIn.viewId,
            })
          }
          element.addEventListener('focus', handler)

          for (let i = 0; i < 10; i++) {
            element.focus()

            await sleep(TimeSpan.milliseconds(0))

            if (focused) {
              break
            }
          }

          resolve(null)
        })
      },
    }
  }

  return { model }
}

export const subscriptions: Sub<Msg> = Sub.none()
