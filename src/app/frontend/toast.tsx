import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { IconXMark, Show, Transition, cn } from '~/@/ui'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { APP_SOUND, SoundCmd, ToastCmd, playSound } from '../@/frontend/cmd'
import { ScreenSize } from '../@/ui/screen/screen-size'

type Ctx = {
  now: Posix
  t: Translator
  screenSize: ScreenSize
}

type Module = AppFrontendModule<{
  Model: Model
  Msg: Msg
  MsgCmdIn: ToastCmd
  Ctx: Ctx
  //
  MsgToFrontend: null
  MsgToBackend: null
  //
  MsgCmdOut: SoundCmd
  //
  MsgEvtIn: null
  MsgEvtOut: null
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
  variant: 'error' | 'info'
  createdAt: Posix
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
      return { model: { ...input.model, toast: null }, msgCmd: [playSound(APP_SOUND.tap)] }
    }

    case 'time-passed': {
      if (!input.model.toast) return { model: input.model }

      const isToastActive = TimeSpan.lte(
        Posix.diff(input.model.toast.createdAt, input.ctx.now),
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
  if (!input.msgCmd) return { model: input.model }

  const toastCmd = input.msgCmd.c

  switch (toastCmd.t) {
    case 'enqueue': {
      const toastNew: Toast = {
        toastId: input.model.runningId,
        text: toastCmd.text,
        duration: toastCmd.duration ?? TimeSpan.seconds(2),
        variant: toastCmd.toastVariant ?? 'info',
        createdAt: input.ctx.now,
        errorMsg: toastCmd.errorMsg ?? null,
      }

      return { model: { ...input.model, runningId: input.model.runningId + 1, toast: toastNew } }
    }
  }
}

export const subscriptions: Module['subscriptions'] = ({ model }) => {
  if (!model.toast) return Sub.None
  return Time.interval('toasts', model.toast.duration, () => ({ t: 'time-passed' }))
}

export const View: Module['View'] = (input) => {
  return (
    <Transition mode='out-in' id='toast-root' onEnter={onEnter} onExit={onExit}>
      <Show
        when={() => input.model.toast}
        render={(toast) => <Toast key={toast.toastId} ctx={input.ctx} toast={toast} dispatch={input.dispatch} />}
      />
    </Transition>
  )
}

const onEnter = async (node: HTMLElement) => {
  await node?.animate([{ transform: 'translateY(-150%)' }, { transform: 'translateY(0%)' }], {
    duration: 200,
    easing: 'ease-in-out',
    fill: 'both',
  }).finished
}

const onExit = async (node: HTMLElement) => {
  await node?.animate([{ transform: 'translateY(0%)' }, { transform: 'translateY(-150%)' }], {
    duration: 200,
    easing: 'ease-in-out',
    fill: 'both',
  }).finished
}

const Toast = (input: { ctx: Ctx; toast: Toast; dispatch: (m: Msg) => void }) => {
  const errorMsg = input.toast.errorMsg
  return (
    <div
      id={String(input.toast.toastId)}
      className='pointer-events-none absolute left-0 top-0 z-40 flex w-full items-center justify-center overflow-visible p-4'
      onMouseDown={() => input.dispatch({ t: 'pressed-down-on-toast', toast: input.toast })}
      onMouseUp={() => input.dispatch({ t: 'pressed-up-on-toast', toast: input.toast })}
      onTouchStart={() => input.dispatch({ t: 'pressed-down-on-toast', toast: input.toast })}
      onTouchEnd={() => input.dispatch({ t: 'pressed-up-on-toast', toast: input.toast })}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className={cn('w-full bg-black', toWidthClass(input))}>
        <div
          className={cn(
            'pointer-events-auto z-40 flex w-full items-center justify-between overflow-hidden rounded-lg border p-3 text-lg text-white shadow-2xl',
            input.toast.variant === 'info' && 'bg-paper',
            input.toast.variant === 'error' && 'border-red-400 bg-red-500',
          )}
          key={input.toast.toastId}
        >
          {input.toast.text}
          {errorMsg && (
            <>
              <button
                type='button'
                className='font-bold'
                onClick={() =>
                  input.dispatch({ t: 'clicked-see-error', errorMsg: errorMsg, toastId: input.toast.toastId })
                }
              >
                See Error
              </button>
            </>
          )}
          <button
            type='button'
            onClick={() =>
              input.dispatch({
                t: 'clicked-dismiss-button',
                toastId: input.toast.toastId,
              })
            }
          >
            <IconXMark className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
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
