import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import type { FocusCmd } from '../../@/frontend/cmd'

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
  msgCmd,
}: {
  msgCmd?: FocusCmd | null
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg) return updateFromMsg({ msg, model })

  if (msgCmd) return updateFromCmd({ msgCmd, model })

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

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) return { model }

  const cmd = msgCmd.c

  switch (cmd.t) {
    case 'focus': {
      return {
        model,
        eff: async (dispatch) => {
          const element = document.getElementById(cmd.viewId)

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
                id: cmd.viewId,
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

    default: {
      return { model }
    }
  }
}

export const subscriptions: Sub<Msg> = Sub.None
