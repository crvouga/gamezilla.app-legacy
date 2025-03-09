import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import type { CopyToClipboardCmd } from '../../@/frontend/cmd'

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

export type Msg = { t: 'copied-to-clipboard'; text: string }

export const update = ({
  msg,
  model,
  msgCmd,
}: {
  msgCmd?: CopyToClipboardCmd | null
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
    case 'copied-to-clipboard': {
      return { model }
    }
  }
}

const updateFromCmd: typeof update = ({ msgCmd, model }) => {
  if (!msgCmd) return { model }

  const cmd = msgCmd.c

  switch (cmd.t) {
    case 'copy-to-clipboard': {
      return {
        model,
        eff: async (dispatch) => {
          await navigator.clipboard.writeText(cmd.text)
          dispatch({
            t: 'copied-to-clipboard',
            text: cmd.text,
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

export const subscriptions: Sub<Msg> = Sub.None
