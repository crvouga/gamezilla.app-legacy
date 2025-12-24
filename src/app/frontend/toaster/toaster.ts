import { Eff } from '~/@/eff'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { IconXMark } from '~/@/ui/icon'
import { PAPER_STYLE } from '~/@/ui/paper'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { ToasterCmd, toasterCmds } from '~/app/@/frontend/toaster-cmd'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

type Ctx = {
  now: UnixMs
  t: Translator
  screenSize: ScreenSize
}

export type Model = {
  toaster_runningId: number
  toaster_toast?: Toast | null
  toaster_hold: {
    [toastId: number]: Toast
  }
  toaster_errorModal?: { errorMsg: string; toastId: number } | null
}

export type ToastVariant = 'error' | 'info' | 'success'

export type Toast = {
  toastId: number
  text: TranslatedText
  duration: TimeSpan
  variant: ToastVariant
  createdAt: UnixMs
  errorMsg?: string | null
}

export const init = (_input: {}): { model: Model } => {
  return { model: { toaster_runningId: 0, toaster_hold: {} } }
}

export type Msg =
  | { n: 'toaster'; t: 'toaster_timePassed' }
  | { n: 'toaster'; t: 'toaster_pressedDownOnToast'; toast: Toast }
  | { n: 'toaster'; t: 'toaster_pressedUpOnToast'; toast: Toast }
  | { n: 'toaster'; t: 'toaster_clickedDismissButton'; toastId: number }
  | { n: 'toaster'; t: 'toaster_clickedSeeError'; errorMsg: string; toastId: number }
  | { n: 'toaster'; t: 'toaster_gotCmd'; c: ToasterCmd }

export const update = (input: {
  model: Model
  msg: Msg
  ctx: Ctx
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'toaster_gotCmd': {
      switch (input.msg.c.t) {
        case 'showToast': {
          const cmd = input.msg.c
          const toastNew: Toast = {
            toastId: input.model.toaster_runningId,
            text: cmd.text,
            duration: cmd.duration ?? TimeSpan.seconds(2),
            variant: cmd.variant ?? 'info',
            createdAt: input.ctx.now,
            errorMsg: cmd.errorMsg ?? null,
          }

          return {
            model: {
              ...input.model,
              toaster_runningId: input.model.toaster_runningId + 1,
              toaster_toast: toastNew,
            },
          }
        }
      }
    }

    case 'toaster_clickedDismissButton': {
      return {
        model: { ...input.model, toaster_toast: null },
        eff: playSound(APP_SOUND.tap),
      }
    }

    case 'toaster_timePassed': {
      if (!input.model.toaster_toast) return { model: input.model }

      const isToastActive = TimeSpan.lte(
        UnixMs.diff(input.model.toaster_toast.createdAt, input.ctx.now),
        input.model.toaster_toast.duration,
      )

      if (isToastActive) return { model: input.model }

      return { model: { ...input.model, toaster_toast: null } }
    }

    case 'toaster_pressedDownOnToast': {
      return {
        model: {
          ...input.model,
          toaster_hold: { ...input.model.toaster_hold, [input.msg.toast.toastId]: input.msg.toast },
        },
      }
    }

    case 'toaster_pressedUpOnToast': {
      const holdNew = { ...input.model.toaster_hold }
      delete holdNew[input.msg.toast.toastId]
      return { model: { ...input.model, toaster_hold: holdNew } }
    }

    case 'toaster_clickedSeeError': {
      return {
        model: { ...input.model, toaster_errorModal: { errorMsg: input.msg.errorMsg, toastId: input.msg.toastId } },
      }
    }
  }
}

export const subscriptions = (input: { model: Model }): Sub<Msg> => {
  return Sub.batch([
    //
    subscriptionsTimePassed(input),
    Sub.map(toasterCmds, (c) => ({ t: 'toaster_gotCmd', c, n: 'toaster' })),
  ])
}

const subscriptionsTimePassed = (input: { model: Model }): Sub<Msg> => {
  if (!input.model.toaster_toast) return Sub.none()
  return Time.interval(
    'toasts',
    input.model.toaster_toast.duration,
    (): Msg => ({ n: 'toaster', t: 'toaster_timePassed' }),
  )
}

export const View = (input: { model: Model; ctx: Ctx; dispatch: (m: Msg) => void }) => {
  return h(ViewToast, input)
}

const ViewToast = (input: { model: Model; ctx: Ctx; dispatch: (m: Msg) => void }) => {
  if (!input.model.toaster_toast) return null
  return h(Toast, {
    key: input.model.toaster_toast.toastId,
    ctx: input.ctx,
    toast: input.model.toaster_toast,
    dispatch: input.dispatch,
  })
}

const Toast = (input: { ctx: Ctx; toast: Toast; dispatch: (m: Msg) => void }) => {
  const errorMsg = input.toast.errorMsg
  return h(
    SafeAreaBox,
    {
      key: input.toast.toastId,
      id: String(input.toast.toastId),
      role: 'alert',
      'data-error': input.toast.variant === 'error',
      'data-info': input.toast.variant === 'info',
      'data-success': input.toast.variant === 'success',
      style: sx({
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
        paddingTop: 4,
      }),
      edges: ['top'],
      onPress: () => input.dispatch({ n: 'toaster', t: 'toaster_pressedDownOnToast', toast: input.toast }),
      onPressOut: () => input.dispatch({ n: 'toaster', t: 'toaster_pressedUpOnToast', toast: input.toast }),
    },
    [
      h(
        Box,
        {
          style: {
            ...sx({
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
              maxWidth: 'md',
            }),
            ...(input.toast.variant === 'info' && PAPER_STYLE),
            ...(input.toast.variant === 'success' && sx({ borderColor: 'green-400', backgroundColor: 'green-500' })),
            ...(input.toast.variant === 'error' && sx({ borderColor: 'red-400', backgroundColor: 'red-500' })),
          },
        },
        [
          h(Text, { text: input.toast.text, style: sx({ textColor: 'white' }) }),
          typeof errorMsg === 'string' &&
            h(
              Pressable,
              {
                style: sx({ fontWeight: 'bold' }),
                onPress: () =>
                  input.dispatch({
                    n: 'toaster',
                    t: 'toaster_clickedSeeError',
                    errorMsg: errorMsg,
                    toastId: input.toast.toastId,
                  }),
              },
              [h(Text, { text: 'See Error', style: sx({ textColor: 'white' }) })],
            ),
          h(
            Pressable,
            {
              role: 'button',
              'aria-label': input.ctx.t('app.dismiss'),
              onPress: () =>
                input.dispatch({
                  n: 'toaster',
                  t: 'toaster_clickedDismissButton',
                  toastId: input.toast.toastId,
                }),
            },
            [h(IconXMark, { style: sx({ size: 5, textColor: 'white' }) })],
          ),
        ],
      ),
    ],
  )
}
