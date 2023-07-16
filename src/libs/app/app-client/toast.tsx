import { ClientAppMsg } from "@gamezilla/shared/client";
import { Cmd, Time } from "@gamezilla/core";
import { IconXMark } from "@gamezilla/shared/ui";

//
//
//
// Model
//
//
//

export type Model = {
  runningId: number;
  toasts: Toast[];
  visualToast: Toast[];
};

export type Toast = {
  toastId: number;
  message: string;
  duration: number;
};

export const init: Model = {
  runningId: 0,
  toasts: [],
  visualToast: [],
};

//
//
//
// Update
//
//
//

export type Msg =
  | {
      t: "time";
    }
  | {
      t: "clicked-dismiss-button";
      toastId: number;
    }
  | {
      t: "toast-duration-elapsed";
      toastId: number;
    };

export const update = ({
  model,
  msg,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "clicked-dismiss-button") {
    return {
      model: {
        ...model,
        toasts: model.toasts.filter((t) => t.toastId !== msg.toastId),
      },
    };
  }

  if (msg.t === "toast-duration-elapsed") {
    return {
      model: {
        ...model,
        toasts: model.toasts.filter((t) => t.toastId !== msg.toastId),
      },
    };
  }

  return { model };
};

export const updateFromApp = ({
  msg,
  model,
}: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  if (msg.t === "toast-enqueued") {
    const toastId = model.runningId;
    const duration = msg.duration ?? 3000;
    return {
      model: {
        ...model,
        runningId: model.runningId + 1,
        toasts: [...model.toasts, { toastId, message: msg.text, duration }],
      },
      cmd: Time.startTimeout(toastId, duration, {
        t: "toast-duration-elapsed",
        toastId: model.runningId,
      }),
    };
  }
  return { model };
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  dispatch,
}: {
  model: Model;
  dispatch: (msg: Msg) => void;
}) => {
  return (
    <div className="pointer-events-none fixed left-0 top-0 flex h-screen w-screen flex-col items-center gap-4 p-4">
      {model.toasts.map((toast) => (
        <div
          className="pointer-events-auto z-40 flex w-full max-w-md items-center justify-between overflow-hidden whitespace-nowrap break-words rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-lg text-white shadow-2xl"
          key={toast.toastId}>
          {toast.message}
          <button
            onClick={() =>
              dispatch({ t: "clicked-dismiss-button", toastId: toast.toastId })
            }>
            <IconXMark />
          </button>
        </div>
      ))}
    </div>
  );
};
