import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { IconXMark, Transition, cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Eff, Time } from "gamezilla/@SHARED/core";

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
  duration: number;
  variant: "error" | "info";
};

export const init = ({
  stored,
}: {
  stored: Model | null;
}): {
  model: Model;
} => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      runningId: 0,
      toast: null,
      hold: {},
    },
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
  | { t: "time" }
  | { t: "pressed-down-on-toast"; toast: Toast }
  | { t: "pressed-up-on-toast"; toast: Toast }
  | { t: "clicked-dismiss-button"; toastId: number }
  | { t: "toast-duration-elapsed"; toastId: number };

export function update(
  model: Model,
  msg: Msg
): {
  model: Model;
  eff?: Eff<Msg>;
} {
  switch (msg.t) {
    case "clicked-dismiss-button": {
      return {
        model: {
          ...model,
          toast: null,
        },
      };
    }

    case "toast-duration-elapsed": {
      if (model.toast?.toastId !== msg.toastId) {
        return { model };
      }
      return {
        model: { ...model, toast: null },
      };
    }

    case "time": {
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
}

//
//
//
//

export function updateFromCmd({
  cmd: msg,
  model,
}: {
  cmd: ClientCmd<{
    ClientMsg: Msg;
    ToServer: never;
  }>;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} {
  switch (msg.t) {
    case "toast/enqueue": {
      const toastNew: Toast = {
        toastId: model.runningId,
        text: msg.text,
        duration: msg.duration ?? 2000,
        variant: msg.toastVariant ?? "info",
      };

      return {
        model: {
          ...model,
          runningId: model.runningId + 1,
          toast: toastNew,
        },

        eff: Eff.batch([
          Time.cancelTimeout(toastNew.toastId),
          Time.startTimeout(toastNew.toastId, toastNew.duration, {
            t: "toast-duration-elapsed",
            toastId: model.runningId,
          }),
        ]),
      };
    }
    default: {
      return { model };
    }
  }
}

//
//
//
// View
//
//
//

export function View({
  model,
  dispatch,
}: {
  model: Model;
  dispatch: (m: Msg) => void;
}) {
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
}

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
