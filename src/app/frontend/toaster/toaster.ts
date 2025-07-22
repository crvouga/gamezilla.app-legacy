import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/box'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { cn } from '~/@/ui/cn'
import { IconXMark } from '~/@/ui/icon'
import { PAPER_CLASS_NAME } from '~/@/ui/paper'
import { Transition } from '~/@/ui/transition'
import { h } from '~/@/vdom/h'
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
  return h(Transition, { mode: 'out-in', id: 'toast-root', onEnter, onExit }, [
    input.model.toast &&
      h(Toast, {
        key: input.model.toast.toastId,
        ctx: input.ctx,
        toast: input.model.toast,
        dispatch: input.dispatch,
      }),
  ])
}

const onEnter = async (node: HTMLElement) => {
  await node?.animate?.([{ transform: 'translateY(-150%)' }, { transform: 'translateY(0%)' }], {
    duration: 200,
    easing: 'ease-in-out',
    fill: 'both',
  }).finished
}

const onExit = async (node: HTMLElement) => {
  await node?.animate?.([{ transform: 'translateY(0%)' }, { transform: 'translateY(-150%)' }], {
    duration: 200,
    easing: 'ease-in-out',
    fill: 'both',
  }).finished
}

const Toast = (input: { ctx: Ctx; toast: Toast; dispatch: (m: Msg) => void }) => {
  const errorMsg = input.toast.errorMsg
  return h(
    Box,
    {
      key: input.toast.toastId,
      id: String(input.toast.toastId),
      role: 'alert',
      'data-error': input.toast.variant === 'error' ? 'true' : 'false',
      'data-info': input.toast.variant === 'info' ? 'true' : 'false',
      'data-success': input.toast.variant === 'success' ? 'true' : 'false',
      class:
        'pointer-events-none absolute top-0 left-0 z-40 flex w-full items-center justify-center overflow-visible p-4',
      onMouseDown: () => input.dispatch({ t: 'pressed-down-on-toast', toast: input.toast }),
      onMouseUp: () => input.dispatch({ t: 'pressed-up-on-toast', toast: input.toast }),
      onTouchStart: () => input.dispatch({ t: 'pressed-down-on-toast', toast: input.toast }),
      onTouchEnd: () => input.dispatch({ t: 'pressed-up-on-toast', toast: input.toast }),
      onContextMenu: (e: any) => e.preventDefault(),
    },
    [
      h(Box, { class: cn('w-full bg-black', toWidthClass(input)) }, [
        h(
          Box,
          {
            class: cn(
              'pointer-events-auto z-40 flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 text-lg text-white shadow-2xl',
              input.toast.variant === 'info' && PAPER_CLASS_NAME,
              input.toast.variant === 'success' && PAPER_CLASS_NAME,
              input.toast.variant === 'error' && 'border-red-400 bg-red-500',
            ),
          },
          [
            input.toast.text,
            errorMsg &&
              h(
                'button',
                {
                  type: 'button',
                  class: 'font-bold',
                  onClick: () =>
                    input.dispatch({ t: 'clicked-see-error', errorMsg: errorMsg, toastId: input.toast.toastId }),
                },
                ['See Error'],
              ),
            h(
              'button',
              {
                type: 'button',
                role: 'button',
                'aria-label': input.ctx.t('app.dismiss'),
                onClick: () => input.dispatch({ t: 'clicked-dismiss-button', toastId: input.toast.toastId }),
              },
              [h(IconXMark, { class: 'h-5 w-5' })],
            ),
          ],
        ),
      ]),
    ],
  )
}

const toWidthClass = (input: { ctx: Ctx }) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return 'w-full'
    case 'tablet':
      return 'w-full max-w-sm'
  }
}
