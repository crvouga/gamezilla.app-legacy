import { ToastCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { IconXMark, Transition, cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Posix, Sub, Time, TimeSpan } from "gamezilla/@SHARED/core";
import { ClientModule } from "../@SHARED/architecture/app-client-v2";

//
//
//
//
//
//
//

type Module = ClientModule<{
  Model: Model;
  Msg: Msg;
  InCmd: ToastCmd;
  Ctx: { now: Posix };
  OutCmd: {};
  InEvt: {};
  FromServer: {};
  OutEvt: {};
}>;

//
//
//
// Model
//
//
//

export type Model = {
  runningId: number;
  toast: Toast | null;
  hold: {
    [toastId: number]: Toast;
  };
};

export type Toast = {
  toastId: number;
  text: string;
  duration: TimeSpan;
  variant: "error" | "info";
  createdAt: Posix;
};

export const init: Module["init"] = ({ stored }) => {
  if (stored) {
    return { model: stored };
  }

  return {
    model: { runningId: 0, toast: null, hold: {} },
  };
};

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
  | { t: "clicked-dismiss-button"; toastId: number };

export const update: Module["update"] = (input) => {
  return ClientModule.chain(
    { model: input.model },
    (model) => updateFromMsg({ ...input, model }),
    (model) => updateFromCmd({ ...input, model })
  );
};

const updateFromMsg: Module["update"] = ({ ctx, msg, model }) => {
  if (msg.v !== "msg") {
    return { model };
  }
  switch (msg.t) {
    case "clicked-dismiss-button": {
      return {
        model: {
          ...model,
          toast: null,
        },
      };
    }

    case "time-passed": {
      if (!model.toast) {
        return { model };
      }

      const isToastActive = TimeSpan.lte(
        Posix.diff(model.toast.createdAt, ctx.now),
        model.toast.duration
      );

      if (!isToastActive) {
        return { model: { ...model, toast: null } };
      }

      return { model };
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
      };
    }

    case "pressed-up-on-toast": {
      const holdNew = { ...model.hold };
      delete holdNew[msg.toast.toastId];
      return {
        model: {
          ...model,
          hold: holdNew,
        },
      };
    }
  }
};

const updateFromCmd: Module["update"] = ({ ctx, msg, model }) => {
  if (msg.v !== "cmd") {
    return { model };
  }

  switch (msg.t) {
    case "toast/enqueue": {
      const toastNew: Toast = {
        toastId: model.runningId,
        text: msg.text,
        duration: msg.duration ?? TimeSpan.fromSeconds(3),
        variant: msg.toastVariant ?? "info",
        createdAt: ctx.now,
      };

      return {
        model: {
          ...model,
          runningId: model.runningId + 1,
          toast: toastNew,
        },
      };
    }
  }
};

//
//
//
//
//
//

export const subscriptions: Module["subscriptions"] = ({
  intervalId,
  model,
}) => {
  if (model.toast) {
    return Time.interval(intervalId, TimeSpan.fromSeconds(1), () => ({
      t: "time-passed",
    }));
  }

  return Sub.None;
};

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
      class="pointer-events-none absolute left-0 top-0 flex w-full flex-col items-center gap-4 px-4 pt-4"
      id="toast-root"
      onEnter={onEnter}
      onExit={onExit}>
      {model.toast && (
        <Toast
          key={model.toast.toastId}
          toast={model.toast}
          dispatch={dispatch}
        />
      )}
    </Transition>
  );
};

async function onEnter(node: HTMLElement) {
  await node?.animate(
    [{ transform: "translateY(-150%)" }, { transform: "translateY(0%)" }],
    {
      duration: 200,
      easing: "ease-in-out",
      fill: "both",
    }
  ).finished;
}

async function onExit(node: HTMLElement) {
  await node?.animate(
    [{ transform: "translateY(0%)" }, { transform: "translateY(-150%)" }],
    {
      duration: 200,
      easing: "ease-in-out",
      fill: "both",
    }
  ).finished;
}

function Toast({
  toast,
  dispatch,
}: {
  toast: Toast;
  dispatch: (m: Msg) => void;
}) {
  return (
    <div
      id={String(toast.toastId)}
      class="w-full overflow-visible"
      //
      onMouseDown={() => dispatch({ t: "pressed-down-on-toast", toast })}
      onMouseUp={() => dispatch({ t: "pressed-up-on-toast", toast })}
      //
      onTouchStart={() => dispatch({ t: "pressed-down-on-toast", toast })}
      onTouchEnd={() => dispatch({ t: "pressed-up-on-toast", toast })}
      //
      onContextMenu={(e) => {
        e.preventDefault();
      }}>
      <div
        class={cn(
          "pointer-events-auto z-40 flex w-full items-center justify-between overflow-hidden  rounded-lg border p-3 text-lg text-white shadow-2xl",
          toast.variant === "info" && "border-neutral-600 bg-neutral-700",
          toast.variant === "error" && "border-red-400 bg-red-500"
        )}
        key={toast.toastId}>
        {toast.text}
        <button
          onClick={() =>
            dispatch({
              t: "clicked-dismiss-button",
              toastId: toast.toastId,
            })
          }>
          <IconXMark />
        </button>
      </div>
    </div>
  );
}
