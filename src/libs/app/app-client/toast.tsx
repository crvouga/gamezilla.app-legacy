import { AppMsg } from "@gamezilla/shared/client";
import { Cmd, Time } from "@gamezilla/shared/core";
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
  msg: AppMsg;
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
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center p-4 pointer-events-none gap-4">
      {model.toasts.map((toast) => (
        <div
          className="bg-neutral-800 border-neutral-600 border w-full max-w-md text-lg text-white p-3 shadow-2xl z-40 rounded-lg pointer-events-auto flex items-center justify-between overflow-hidden whitespace-nowrap break-words"
          key={toast.toastId}>
          {toast.message}
          <button
            onClick={() =>
              $send({ t: "clicked-dismiss-button", toastId: toast.toastId })
            }>
            <IconXMark />
          </button>
        </div>
      ))}
    </div>
  );
};
