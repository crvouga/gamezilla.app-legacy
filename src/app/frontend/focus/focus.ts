import { Eff } from '~/@/eff'
import { isAnyMsg } from '~/@/msg/msg'
import { sleep } from '~/@/promise/sleep'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/frontend/app-frontend-module'
import { FocusViewCmd } from '~/app/@/frontend/focus-view-cmd.$msg'

export type Model = {}

export const init = (_input: {}): { model: Model } => {
  return {
    model: {},
  }
}

export type Msg = { t: 'focus_elementFocused'; id: string }

const isMsg = (msg: unknown): msg is Msg => isAnyMsg(msg) && msg.t.startsWith('focus_')

export const update = <TModel extends Model>(input: {
  msgIn?: unknown
  msg?: unknown
  model: TModel
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

const updateFromMsg = <TModel extends Model>(input: {
  model: TModel
  msg?: unknown
}): {
  model: TModel
  msgOut?: unknown[]
} => {
  if (!isMsg(input.msg)) return { model: input.model }

  switch (input.msg.t) {
    case 'focus_elementFocused': {
      return { model: input.model }
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
  if (FocusViewCmd.is(msgIn)) {
    return {
      model: input.model,
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
              t: 'focus_elementFocused',
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

  return { model: input.model }
}

export const subscriptions: Sub<Msg> = Sub.none()
