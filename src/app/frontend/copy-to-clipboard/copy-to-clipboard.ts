import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd.$msg'

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
  msgIn,
}: {
  msg?: Msg | null
  model: Model
  msgIn?: unknown
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
    case 'copied-to-clipboard': {
      return { model }
    }
  }
}

const updateFromCmd: typeof update = ({ msgIn, model }) => {
  if (CopyToClipboardCmd.is(msgIn)) {
    return {
      model,
      eff: async (dispatch) => {
        await navigator.clipboard.writeText(msgIn.text)
        dispatch({
          t: 'copied-to-clipboard',
          text: msgIn.text,
        })
      },
    }
  }

  return { model }
}

export const subscriptions: Sub<Msg> = Sub.none()
