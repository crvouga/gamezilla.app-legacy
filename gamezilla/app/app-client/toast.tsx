import {
  Eff,
  Time,
  Transition,
  andThen,
  dissoc,
  p,
} from "gamezilla/@SHARED/core";
import { ClientCmd } from "gamezilla/app/@SHARED/client";
import { IconXMark } from "gamezilla/app/@SHARED/ui";

//
//
//
// Animation
//
//
//

const ROOT_HTML_ID = "toast-root";

const config: Transition.Config<Toast> = {
  toId: (toast) => `toast-${String(toast.toastId)}`,
  enter: async (toast) => {
    const node = await Transition.waitForElementById(
      config.toId(toast),
      ROOT_HTML_ID
    );

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
    const node = await Transition.waitForElementById(
      config.toId(toast),
      ROOT_HTML_ID
    );

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
  hold: {
    [toastId: number]: Toast;
  };
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
  hold: {},
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
  | { t: "pressed-down-on-toast"; toast: Toast }
  | { t: "pressed-up-on-toast"; toast: Toast }
  | { t: "clicked-dismiss-button"; toastId: number }
  | { t: "toast-duration-elapsed"; toastId: number }
  | { t: "ui-toast"; c: Transition.Msg };

export function update(
  model: Model,
  msg: Msg
): {
  model: Model;
  eff?: Eff<Msg>;
} {
  return p(
    { model },
    andThen((model) => updateMain(model, msg)),
    andThen(watch)
  );
}

const updateMain: typeof update = (model, msg) => {
  switch (msg.t) {
    case "ui-toast": {
      const uiToasts = Transition.update(model.uiToasts, msg.c);
      return { model: { ...model, uiToasts } };
    }

    case "clicked-dismiss-button": {
      return {
        model: {
          ...model,
          toasts: model.toasts.filter((t) => t.toastId !== msg.toastId),
        },
      };
    }

    case "toast-duration-elapsed": {
      return {
        model: {
          ...model,
          toasts: model.toasts.filter((t) => t.toastId !== msg.toastId),
        },
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
      return {
        model: {
          ...model,
          hold: dissoc(model.hold, msg.toast.toastId),
        },
      };
    }
  }
};

const toVisibleToast = (model: Model): Toast[] => {
  return [...model.toasts, ...Object.values(model.hold)];
};

function watch(model: Model): { model: Model; eff: Eff<Msg> } {
  const uiToasts = Transition.watch(
    config,
    model.uiToasts,
    toVisibleToast(model)
  );
  return {
    model: { ...model, uiToasts: uiToasts.model },
    eff: Eff.t("ui-toast", uiToasts.eff),
  };
}

//
//
//
//

export function updateFromCmd({
  cmd: msg,
  model,
}: {
  cmd: ClientCmd<unknown>;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} {
  switch (msg.t) {
    case "toast/enqueue": {
      const toastId = model.runningId;
      const duration = msg.duration ?? 2000;
      const updated: ReturnType<typeof updateFromCmd> = {
        model: {
          ...model,
          runningId: model.runningId + 1,
          toasts: [...model.toasts, { toastId, message: msg.text, duration }],
        },

        eff: Time.startTimeout(toastId, duration, {
          t: "toast-duration-elapsed",
          toastId: model.runningId,
        }),
      };
      return p(updated, andThen(watch));
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
    <div
      id={ROOT_HTML_ID}
      className="pointer-events-none absolute left-0 top-0 flex w-full flex-col items-center gap-4 px-4 pt-4">
      {model.uiToasts.map(({ item: toast }) => (
        <div
          key={String(config.toId(toast))}
          id={String(config.toId(toast))}
          className="w-full overflow-visible"
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
            // whitespace-nowrap break-words
            className="pointer-events-auto z-40 flex w-full max-w-md items-center justify-between overflow-hidden  rounded-lg border border-neutral-700 bg-neutral-700 p-3 text-lg text-white shadow-2xl"
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
