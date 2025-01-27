import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { IconXMark, Show, Transition, cn } from '~/@/ui'
import { APP_SOUND, SoundCmd, ToastCmd, playSound } from '../@/frontend/cmd'

//
//
//
// Module
//
//
//

type Ctx = {
  now: Posix
  t: Translator
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

//
//
//
// Model
//
//
//

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
  return {
    model: { runningId: 0, hold: {} },
  }
}

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'time-passed' }
  | { t: 'pressed-down-on-toast'; toast: Toast }
  | { t: 'pressed-up-on-toast'; toast: Toast }
  | { t: 'clicked-dismiss-button'; toastId: number }
  | {
      t: 'clicked-see-error'
      errorMsg: string
      toastId: number
    }

export const update: Module['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: Module['update'] = (input) => {
  if (!input.msg) {
    return { model: input.model }
  }

  const { ctx, model, msg } = input

  switch (msg.t) {
    case 'clicked-dismiss-button': {
      return {
        model: {
          ...model,
          toast: null,
        },
        msgCmd: [playSound(APP_SOUND.tap)],
      }
    }

    case 'time-passed': {
      if (!model.toast) {
        return {
          model,
        }
      }

      const isToastInactive = TimeSpan.lte(model.toast.duration, Posix.diff(model.toast.createdAt, ctx.now))

      if (isToastInactive) {
        return {
          model: {
            ...model,
            toast: null,
          },
        }
      }

      return {
        model,
      }
    }

    case 'pressed-down-on-toast': {
      return {
        model: {
          ...model,
          hold: {
            ...model.hold,
            [msg.toast.toastId]: msg.toast,
          },
        },
      }
    }

    case 'pressed-up-on-toast': {
      const holdNew = {
        ...model.hold,
      }
      delete holdNew[msg.toast.toastId]
      return {
        model: {
          ...model,
          hold: holdNew,
        },
      }
    }

    case 'clicked-see-error': {
      return {
        model: {
          ...model,
          errorModal: {
            errorMsg: msg.errorMsg,
            toastId: msg.toastId,
          },
        },
      }
    }
  }
}

const updateFromCmd: Module['update'] = (input) => {
  if (!input.msgCmd) {
    return { model: input.model }
  }

  const { ctx, msgCmd, model } = input

  const toastCmd = msgCmd.c

  switch (toastCmd.t) {
    case 'enqueue': {
      const toastNew: Toast = {
        toastId: model.runningId,
        text: toastCmd.text,
        duration: toastCmd.duration ?? TimeSpan.seconds(2),
        variant: toastCmd.toastVariant ?? 'info',
        createdAt: ctx.now,
        errorMsg: toastCmd.errorMsg ?? null,
      }

      return {
        model: {
          ...model,
          runningId: model.runningId + 1,
          toast: toastNew,
        },
      }
    }
  }
}

//
//
//
//
//
//

export const subscriptions: Module['subscriptions'] = ({ model }) => {
  if (model.toast) {
    return Time.interval('toasts', model.toast.duration, () => ({
      t: 'time-passed',
    }))
  }

  return Sub.None
}

//
//
//
// View
//
//
//

export const View: Module['View'] = (input) => {
  return (
    <Transition mode='out-in' id='toast-root' onEnter={onEnter} onExit={onExit}>
      <Show
        when={() => input.model.toast}
        render={(toast) => <Toast key={toast.toastId} toast={toast} dispatch={input.dispatch} />}
      />
    </Transition>
  )
}

const onEnter = async (node: HTMLElement) => {
  await node?.animate(
    [
      {
        transform: 'translateY(-150%)',
      },
      {
        transform: 'translateY(0%)',
      },
    ],
    {
      duration: 200,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ).finished
}

const onExit = async (node: HTMLElement) => {
  await node?.animate(
    [
      {
        transform: 'translateY(0%)',
      },
      {
        transform: 'translateY(-150%)',
      },
    ],
    {
      duration: 200,
      easing: 'ease-in-out',
      fill: 'both',
    },
  ).finished
}

const Toast = (input: { toast: Toast; dispatch: (m: Msg) => void }) => {
  const errorMsg = input.toast.errorMsg
  return (
    <div
      id={String(input.toast.toastId)}
      className='pointer-events-none absolute left-0 top-0 z-40 w-full overflow-visible p-4'
      //
      onMouseDown={() =>
        input.dispatch({
          t: 'pressed-down-on-toast',
          toast: input.toast,
        })
      }
      onMouseUp={() =>
        input.dispatch({
          t: 'pressed-up-on-toast',
          toast: input.toast,
        })
      }
      //
      onTouchStart={() =>
        input.dispatch({
          t: 'pressed-down-on-toast',
          toast: input.toast,
        })
      }
      onTouchEnd={() =>
        input.dispatch({
          t: 'pressed-up-on-toast',
          toast: input.toast,
        })
      }
      //
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      <div className='bg-black'>
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
                  input.dispatch({
                    t: 'clicked-see-error',
                    errorMsg: errorMsg,
                    toastId: input.toast.toastId,
                  })
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
