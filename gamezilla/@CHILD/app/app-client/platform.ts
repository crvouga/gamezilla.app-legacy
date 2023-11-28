import { Browser, Eff, Sub, Time } from "gamezilla/@SHARED/core";
import { PlatformCmd } from "../@SHARED/client";

export type Model = {
  documentVisibilityState: DocumentVisibilityState;
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
      documentVisibilityState: document.visibilityState,
    },
  };
};

export type Msg =
  | {
      t: "document-visibility-change";
      state: DocumentVisibilityState;
    }
  | {
      t: "element-focused";
      id: string;
    };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
} => {
  switch (msg.t) {
    case "document-visibility-change": {
      return {
        model: {
          ...model,
          documentVisibilityState: msg.state,
        },
      };
    }

    case "element-focused": {
      return {
        model,
      };
    }
  }
};

export const updateFromCmd = <TClientMsg>({
  cmd,
  model,
}: {
  cmd: PlatformCmd<TClientMsg>;
  model: Model;
}): {
  model: Model;
  parentEff?: Eff<TClientMsg>;
  eff?: Eff<Msg>;
} => {
  switch (cmd.t) {
    case "platform/focus": {
      return {
        model,
        eff: async (dispatch) => {
          const element = document.getElementById(cmd.viewId);

          if (!element) {
            return;
          }

          await new Promise<null>(async (resolve) => {
            let focused = false;
            const handler = () => {
              focused = true;
              element.removeEventListener("focus", handler);
              dispatch({
                t: "element-focused",
                id: cmd.viewId,
              });
            };
            element.addEventListener("focus", handler);

            for (let i = 0; i < 10; i++) {
              element.focus();

              await new Promise((resolve) => setTimeout(resolve, 500));
              if (focused) {
                break;
              }
            }

            resolve(null);
          });
        },
      };
    }

    case "platform/start-timeout": {
      return {
        model,
        parentEff: Time.startTimeout(cmd.timeoutId, cmd.duration, cmd.msg),
      };
    }

    case "platform/cancel-timeout": {
      return {
        model,
        parentEff: Time.cancelTimeout(cmd.timeoutId),
      };
    }

    default: {
      return {
        model,
      };
    }
  }
};

export const subscriptions: Sub<Msg> = Browser.onDocumentVisibilityState<Msg>(
  (state) => ({
    t: "document-visibility-change",
    state,
  })
);
