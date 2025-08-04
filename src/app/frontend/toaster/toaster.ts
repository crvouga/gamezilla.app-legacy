import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { IconXMark } from '~/@/ui/icon'
import { PAPER_STYLE } from '~/@/ui/paper'
import { theme } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import { Text } from '~/@/vdom/primitives/text'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd.$msg'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { APP_SOUND } from '../../@/frontend/app-sound'

type Ctx = {
  now: UnixMs
  t: Translator
  screenSize: ScreenSize
}

type Module = AppFrontendModule<{
  Model: Model
  Msg: Msg
  Ctx: Ctx
}>

export type Model = {
  runningId: number
  toast?: Toast | null
  hold: {
    [toastId: number]: Toast
  }
  errorModal?: { errorMsg: string; toastId: number } | null
}

export type Toast = {
  toastId: number
  text: TranslatedText
  duration: TimeSpan
  variant: 'error' | 'info' | 'success'
  createdAt: UnixMs
  errorMsg?: string | null
}

export const init: Module['init'] = () => {
  return { model: { runningId: 0, hold: {} } }
}

export type Msg =
  | { t: 'time-passed' }
  | { t: 'pressed-down-on-toast'; toast: Toast }
  | { t: 'pressed-up-on-toast'; toast: Toast }
  | { t: 'clicked-dismiss-button'; toastId: number }
  | { t: 'clicked-see-error'; errorMsg: string; toastId: number }

export const update: Module['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: Module['update'] = (input) => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'clicked-dismiss-button': {
      return { model: { ...input.model, toast: null }, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }

    case 'time-passed': {
      if (!input.model.toast) return { model: input.model }

      const isToastActive = TimeSpan.lte(
        UnixMs.diff(input.model.toast.createdAt, input.ctx.now),
        input.model.toast.duration,
      )

      if (isToastActive) return { model: input.model }

      return { model: { ...input.model, toast: null } }
    }

    case 'pressed-down-on-toast': {
      return {
        model: { ...input.model, hold: { ...input.model.hold, [input.msg.toast.toastId]: input.msg.toast } },
      }
    }

    case 'pressed-up-on-toast': {
      const holdNew = { ...input.model.hold }
      delete holdNew[input.msg.toast.toastId]
      return { model: { ...input.model, hold: holdNew } }
    }

    case 'clicked-see-error': {
      return {
        model: { ...input.model, errorModal: { errorMsg: input.msg.errorMsg, toastId: input.msg.toastId } },
      }
    }
  }
}

const updateFromCmd: Module['update'] = (input) => {
  const { msgIn } = input
  if (ShowToastCmd.is(msgIn)) {
    const toastNew: Toast = {
      toastId: input.model.runningId,
      text: msgIn.text,
      duration: msgIn.duration ?? TimeSpan.seconds(2),
      variant: msgIn.toastVariant ?? 'info',
      createdAt: input.ctx.now,
      errorMsg: msgIn.errorMsg ?? null,
    }

    return {
      model: { ...input.model, runningId: input.model.runningId + 1, toast: toastNew },
    }
  }

  return { model: input.model }
}

export const subscriptions: Module['subscriptions'] = ({ model }) => {
  if (!model.toast) return Sub.none()
  return Time.interval('toasts', model.toast.duration, (): Msg => ({ t: 'time-passed' }))
}

export const View: Module['View'] = (input) => {
  return h(ViewToast, input)
}

const ViewToast: Module['View'] = (input) => {
  if (!input.model.toast) return null
  return h(Toast, {
    key: input.model.toast.toastId,
    ctx: input.ctx,
    toast: input.model.toast,
    dispatch: input.dispatch,
  })
}

const Toast = (input: { ctx: Ctx; toast: Toast; dispatch: (m: Msg) => void }) => {
  const errorMsg = input.toast.errorMsg
  return h(
    Box,
    {
      key: input.toast.toastId,
      id: String(input.toast.toastId),
      role: 'alert',
      'data-error': input.toast.variant === 'error',
      'data-info': input.toast.variant === 'info',
      'data-success': input.toast.variant === 'success',
      style: theme({
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 40,
        flexDirection: 'row',
        width: 'full',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 4,
      }),
      onPress: () => input.dispatch({ t: 'pressed-down-on-toast', toast: input.toast }),
      onPressOut: () => input.dispatch({ t: 'pressed-up-on-toast', toast: input.toast }),
    },
    [
      h(
        SafeAreaBox,
        {
          edges: ['top'],
          style: theme({ width: 'full', maxWidth: input.ctx.screenSize === 'mobile' ? undefined : 'sm' }),
        },
        [
          h(
            Box,
            {
              style: {
                ...theme({
                  pointerEvents: 'auto',
                  zIndex: 40,
                  flexDirection: 'row',
                  width: 'full',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  rounded: 'lg',
                  borderWidth: 1,
                  padding: 4,
                  fontSize: 'lg',
                }),
                ...(input.toast.variant === 'info' && PAPER_STYLE),
                ...(input.toast.variant === 'success' && PAPER_STYLE),
                ...(input.toast.variant === 'error' && { borderColor: 'red-400', backgroundColor: 'red-500' }),
              },
            },
            [
              h(Text, { text: input.toast.text, style: theme({ textColor: 'white' }) }),
              typeof errorMsg === 'string' &&
                h(
                  Pressable,
                  {
                    style: theme({ fontWeight: 'bold' }),
                    onPress: () =>
                      input.dispatch({ t: 'clicked-see-error', errorMsg: errorMsg, toastId: input.toast.toastId }),
                  },
                  [h(Text, { text: 'See Error', style: theme({ textColor: 'white' }) })],
                ),
              h(
                Pressable,
                {
                  role: 'button',
                  'aria-label': input.ctx.t('app.dismiss'),
                  onPress: () => input.dispatch({ t: 'clicked-dismiss-button', toastId: input.toast.toastId }),
                },
                [h(IconXMark, { style: theme({ size: 5, textColor: 'white' }) })],
              ),
            ],
          ),
        ],
      ),
    ],
  )
}
