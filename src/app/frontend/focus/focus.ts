import { Eff } from '~/@/eff'
import { sleep } from '~/@/promise/sleep'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { FocusCmd, focusCmds } from './focus-cmd'

export type Model = {}

export const init = (_input: {}): { model: Model } => {
  return {
    model: {},
  }
}

export type Msg = { n: 'focus'; t: 'focus_elementFocused'; id: string } | { n: 'focus'; t: 'focus_gotCmd'; c: FocusCmd }

export const update = (input: {
  ctx: unknown
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'focus_elementFocused': {
      return { model: input.model }
    }
    case 'focus_gotCmd': {
      const { c } = input.msg
      switch (c.t) {
        case 'focus': {
          return {
            model: input.model,
            eff: async (dispatch) => {
              const element = document.getElementById(c.viewId)

              if (!element) {
                return
              }

              await new Promise<null>(async (resolve) => {
                let focused = false
                const handler = () => {
                  focused = true
                  element.removeEventListener('focus', handler)
                  dispatch({
                    n: 'focus',
                    t: 'focus_elementFocused',
                    id: c.viewId,
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
      }
    }
  }
}

export const subscriptions: Sub<Msg> = Sub.map(focusCmds, (cmd) => ({
  n: 'focus',
  t: 'focus_gotCmd',
  c: cmd,
}))
