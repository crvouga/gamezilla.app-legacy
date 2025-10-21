import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { CopyToClipboardCmd, copyToClipboardCmds } from './copy-to-clipboard-cmd'

export type Model = {}

export const init = (_input: {}): { model: Model } => {
  return {
    model: {},
  }
}

export type Msg =
  | { n: 'copyToClipboard'; t: 'copyToClipboard_copiedToClipboard'; text: string }
  | { n: 'copyToClipboard'; t: 'copyToClipboard_gotCmd'; c: CopyToClipboardCmd }

export const update = (input: {
  ctx: unknown
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  const { msg } = input
  switch (msg.t) {
    case 'copyToClipboard_copiedToClipboard': {
      return {
        model: input.model,
        eff: async (dispatch) => {
          await navigator.clipboard.writeText(msg.text)
          dispatch({ n: 'copyToClipboard', t: 'copyToClipboard_copiedToClipboard', text: msg.text })
        },
      }
    }
    case 'copyToClipboard_gotCmd': {
      const { c } = msg
      switch (c.t) {
        case 'copyToClipboard': {
          return {
            model: input.model,
            eff: async (dispatch) => {
              await navigator.clipboard.writeText(c.text)
              dispatch({ n: 'copyToClipboard', t: 'copyToClipboard_copiedToClipboard', text: c.text })
            },
          }
        }
        default: {
          return { model: input.model }
        }
      }
    }
  }
}

export const subscriptions: Sub<Msg> = Sub.map(copyToClipboardCmds, (cmd) => ({
  n: 'copyToClipboard',
  t: 'copyToClipboard_copiedToClipboard',
  text: cmd.text,
}))
