import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import { ToastCmd } from "gamezilla/@CHILD/app/@SHARED/client"
import { IconXMark, Transition, cn } from "gamezilla/@CHILD/app/@SHARED/ui"
import { Posix, Sub, Time, TimeSpan } from "gamezilla/@SHARED/core"

//
//
//
// Module
//
//
//

type Ctx = { now: Posix }

type Module = AppClientModule<{
  Model: Model
  Msg: Msg
  MsgInCmd: ToastCmd
  Ctx: Ctx
  //
  MsgToClient: null
  MsgToServer: null
  //
  MsgOutCmd: null
  //
  MsgInEvent: null
  MsgOutEvent: null
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
  text: string
  duration: TimeSpan
  variant: "error" | "info"
  createdAt: Posix
  errorMsg?: string | null
}

export const init: Module["init"] = async ({ stored }) => {
  if (stored) {
    return { model: stored }
  }

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
  | { t: "time-passed" }
  | { t: "pressed-down-on-toast"; toast: Toast }
  | { t: "pressed-up-on-toast"; toast: Toast }
  | { t: "clicked-dismiss-button"; toastId: number }
  | { t: "clicked-see-error"; errorMsg: string; toastId: number }

export const update: Module["update"] = (input) => {
  return AppClientModule.chainUpdates(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
  )
}

const updateFromMsg: Module["update"] = async (input) => {
  if (!input.msg) {
    return { model: input.model }
  }

  const { ctx, model, msg } = input

  switch (msg.t) {
    case "clicked-dismiss-button": {
      return {
        model: {
          ...model,
          toast: null,
        },
      }
    }

    case "time-passed": {
      if (!model.toast) {
        return { model }
      }

      const isToastInactive = TimeSpan.lte(
        model.toast.duration,
        Posix.diff(model.toast.createdAt, ctx.now),
      )

      if (isToastInactive) {
        return { model: { ...model, toast: null } }
      }

      return { model }
    }

    case "pressed-down-on-toast": {
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

    case "pressed-up-on-toast": {
      const holdNew = { ...model.hold }
      delete holdNew[msg.toast.toastId]
      return {
        model: {
          ...model,
          hold: holdNew,
        },
      }
    }

    case "clicked-see-error": {
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

const updateFromCmd: Module["update"] = async (input) => {
  if (!input.msgCmd) {
    return { model: input.model }
  }

  const { ctx, msgCmd, model } = input

  const toastCmd = msgCmd.c

  switch (toastCmd.t) {
    case "enqueue": {
      const toastNew: Toast = {
        toastId: model.runningId,
        text: toastCmd.text,
        duration: toastCmd.duration ?? TimeSpan.fromSeconds(2),
        variant: toastCmd.toastVariant ?? "info",
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

export const subscriptions: Module["subscriptions"] = ({ model }) => {
  if (model.toast) {
    return Time.interval("toasts", model.toast.duration, () => ({
      t: "time-passed",
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

export const View: Module["View"] = ({ model, dispatch }) => {
  return (
    <Transition
      mode="out-in"
      className="pointer-events-none absolute left-0 top-0 z-[100] flex w-full flex-col items-center gap-4 px-4 pt-4 "
      id="toast-root"
      onEnter={onEnter}
      onExit={onExit}
    >
      {model.toast && (
        <Toast
          key={model.toast.toastId}
          toast={model.toast}
          dispatch={dispatch}
        />
      )}
    </Transition>
  )
}

async function onEnter(node: HTMLElement) {
  await node?.animate(
    [{ transform: "translateY(-150%)" }, { transform: "translateY(0%)" }],
    {
      duration: 200,
      easing: "ease-in-out",
      fill: "both",
    },
  ).finished
}

async function onExit(node: HTMLElement) {
  await node?.animate(
    [{ transform: "translateY(0%)" }, { transform: "translateY(-150%)" }],
    {
      duration: 200,
      easing: "ease-in-out",
      fill: "both",
    },
  ).finished
}

function Toast({
  toast,
  dispatch,
}: {
  toast: Toast
  dispatch: (m: Msg) => void
}) {
  const errorMsg = toast.errorMsg
  return (
    <div
      id={String(toast.toastId)}
      className="w-full overflow-visible"
      //
      onMouseDown={() => dispatch({ t: "pressed-down-on-toast", toast })}
      onMouseUp={() => dispatch({ t: "pressed-up-on-toast", toast })}
      //
      onTouchStart={() => dispatch({ t: "pressed-down-on-toast", toast })}
      onTouchEnd={() => dispatch({ t: "pressed-up-on-toast", toast })}
      //
      onContextMenu={(e) => {
        e.preventDefault()
      }}
    >
      <div
        className={cn(
          "pointer-events-auto z-40 flex w-full items-center justify-between overflow-hidden  rounded-lg border p-3 text-lg text-white shadow-2xl",
          toast.variant === "info" && "border-neutral-600 bg-neutral-700",
          toast.variant === "error" && "border-red-400 bg-red-500",
        )}
        key={toast.toastId}
      >
        {toast.text}
        {errorMsg && (
          <>
            <button
              className="font-bold"
              onClick={() =>
                dispatch({
                  t: "clicked-see-error",
                  errorMsg: errorMsg,
                  toastId: toast.toastId,
                })
              }
            >
              See Error
            </button>
          </>
        )}
        <button
          onClick={() =>
            dispatch({
              t: "clicked-dismiss-button",
              toastId: toast.toastId,
            })
          }
        >
          <IconXMark />
        </button>
      </div>
    </div>
  )
}
