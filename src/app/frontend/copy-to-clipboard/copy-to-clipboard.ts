import { Eff } from '~/@/eff'
import { isAnyMsg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { CopyToClipboardCmd } from '~/app/@/frontend/copy-to-clipboard-cmd.$msg'

export type Model = {}

export const init = (_input: {}): { model: Model } => {
  return {
    model: {},
  }
}

export type Msg = { t: 'copyToClipboard_copiedToClipboard'; text: string }

const isMsg = (msg: unknown): msg is Msg => isAnyMsg(msg) && msg.t.startsWith('copyToClipboard_')

export const update = <TModel extends Model>(input: {
  msg?: unknown
  model: TModel
  msgIn?: unknown
}): {
  model: TModel
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  return AppFrontendModule.andThen<{ Model: TModel; Msg: Msg }>(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg = <TModel extends Model>(input: { model: TModel; msg?: unknown }) => {
  if (!isMsg(input.msg)) return { model: input.model }

  switch (input.msg.t) {
    case 'copyToClipboard_copiedToClipboard': {
      return { model: input.model, msgOut: [input.msg.text] }
    }
  }
}

const updateFromCmd = <TModel extends Model>(input: {
  model: TModel
  msgIn?: unknown
}): {
  model: TModel
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  const { msgIn } = input
  if (CopyToClipboardCmd.is(msgIn)) {
    return {
      model: input.model,
      eff: async (dispatch) => {
        await navigator.clipboard.writeText(msgIn.text)
        dispatch({ t: 'copyToClipboard_copiedToClipboard', text: msgIn.text })
      },
    }
  }

  return { model: input.model }
}

export const subscriptions: Sub<Msg> = Sub.none()
