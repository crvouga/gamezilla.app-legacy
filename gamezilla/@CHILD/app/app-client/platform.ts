import { Browser, Eff, Sub, Time } from "gamezilla/@SHARED/core";
import { ClientCmd, PlatformCmd } from "../@SHARED/client";

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
  return {
    model: {
      documentVisibilityState: document.visibilityState,
    },
  };
};

export type Msg = {
  t: "document-visibility-change";
  state: DocumentVisibilityState;
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
  }
};

export const updateFromCmd = ({
  cmd,
  model,
}: {
  cmd: PlatformCmd<{
    ClientMsg: Msg;
    ToServer: any;
  }>;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (cmd.t) {
    case "view/focus": {
      return {
        model,
        eff: () => {
          const element = document.getElementById(cmd.htmlId);
          if (element) {
            element.focus();
          }
        },
      };
    }

    case "time/start-timeout": {
      return {
        model,
        eff: Time.startTimeout(cmd.timeoutId, cmd.duration, cmd.msg),
      };
    }

    case "time/cancel-timeout": {
      return {
        model,
        eff: Time.cancelTimeout(cmd.timeoutId),
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
