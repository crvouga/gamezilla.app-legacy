import { Transition, Cmd, Time, p, andThen } from "@gamezilla/core";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { IconXMark } from "@gamezilla/ui";

const config: Transition.Config<Toast> = {
  toId: (toast) => `toast-${String(toast.toastId)}`,
  enter: async (toast) => {
    const node = await Transition.waitForElementById(config.toId(toast));

    await node?.animate(
      [{ transform: "translateY(-100%)" }, { transform: "translateY(0%)" }],
      {
        duration: 200,
        easing: "ease-in-out",
        fill: "both",
      }
    ).finished;
  },
  exit: async (toast) => {
    const node = await Transition.waitForElementById(config.toId(toast));

    await node?.animate(
      [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
      {
        duration: 200,
        easing: "ease-in-out",
        fill: "both",
      }
    ).finished;
  },
};

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
  uiToasts: Transition.Model<Toast>;
};

export type Toast = {
  toastId: number;
  message: string;
  duration: number;
};

export const init: Model = {
  runningId: 0,
  toasts: [],
  uiToasts: Transition.init<Toast>(),
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
  | { t: "clicked-dismiss-button"; toastId: number }
  | { t: "toast-duration-elapsed"; toastId: number }
  | { t: "ui-toast"; c: Transition.Msg };

export function update(
  model: Model,
  msg: Msg
): {
  model: Model;
  cmd?: Cmd<Msg>;
} {
  return p(
    { model },
    andThen((model) => update_(model, msg)),
    andThen(watch)
  );
}

const update_: typeof update = (model, msg) => {
  if (msg.t === "ui-toast") {
    const uiToasts = Transition.update(model.uiToasts, msg.c);
    return { model: { ...model, uiToasts } };
  }

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

function watch(model: Model): { model: Model; cmd: Cmd<Msg> } {
  const uiToasts = Transition.watch(config, model.uiToasts, model.toasts);
  return {
    model: { ...model, uiToasts: uiToasts.model },
    cmd: Cmd.tag("ui-toast", uiToasts.cmd),
  };
}

//
//
//
//

export function updateFromApp({
  msg,
  model,
}: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} {
  if (msg.t === "toast-enqueued") {
    const toastId = model.runningId;
    const duration = msg.duration ?? 2000;
    const updated: ReturnType<typeof updateFromApp> = {
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
    return p(updated, andThen(watch));
  }

  return { model };
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
  dispatch: (msg: Msg) => void;
}) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 flex w-full flex-col items-center gap-4 px-4 pt-4">
      {model.uiToasts.map(({ item: toast }) => (
        <div
          key={String(config.toId(toast))}
          id={String(config.toId(toast))}
          className="w-full overflow-visible">
          <div
            className="pointer-events-auto z-40 flex w-full max-w-md items-center justify-between overflow-hidden whitespace-nowrap break-words rounded-lg border border-neutral-700 bg-neutral-700 p-3 text-lg text-white shadow-2xl"
            key={toast.toastId}>
            {toast.message}
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
      ))}
    </div>
  );
}
