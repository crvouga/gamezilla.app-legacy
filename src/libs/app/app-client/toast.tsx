import { TransitionList, Cmd, Time, p, andThen } from "@gamezilla/core";
import { ClientAppMsg } from "@gamezilla/shared/client";
import { IconXMark } from "@gamezilla/ui";

const config: TransitionList.Config<Toast> = {
  toId: (toast) => `toast-${String(toast.toastId)}`,
  enter: async (toast) => {
    const node = await TransitionList.waitForElementById(config.toId(toast));

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
    const node = await TransitionList.waitForElementById(config.toId(toast));

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
  uiToasts: TransitionList.Model<Toast>;
};

export type Toast = {
  toastId: number;
  message: string;
  duration: number;
};

export const init: Model = {
  runningId: 0,
  toasts: [],
  uiToasts: TransitionList.init<Toast>([]),
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
  | { t: "uiToast"; c: TransitionList.Msg<Toast> };

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
  return p(
    { model },
    andThen(({ model }) => updateToasts({ model, msg })),
    andThen(({ model }) => updateTransitions({ model, msg }))
  );
};
const updateToasts: typeof update = ({ model, msg }) => {
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

const updateTransitions = ({
  model,
  msg,
}: {
  msg?: Msg;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  const updated = TransitionList.update({
    config,
    model: model.uiToasts,
    msg: msg?.t === "uiToast" ? msg.c : undefined,
    list: model.toasts,
  });
  return {
    model: {
      ...model,
      uiToasts: updated.model,
    },
    cmd: Cmd.tag_("uiToast", updated.cmd),
  };
};

//
//
//
//

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
    return p(updated, andThen(updateTransitions));
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
    <div className="pointer-events-none fixed left-0 top-0 flex h-screen w-screen flex-col items-center">
      {model.uiToasts.map(({ item: toast }) => (
        <div
          key={config.toId(toast)}
          id={config.toId(toast)}
          className="w-full p-4 pb-0">
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
};
