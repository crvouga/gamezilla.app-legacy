import { PubSub } from "gamezilla/@SHARED/core";
import { ClientCmd, ClientEvt } from "gamezilla/@CHILD/app/@SHARED/client";
import { IconSpinner } from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientToServerMsg, ClientWireMsg } from "../wire";

//
//
//
// Model
//
//
//

export type Model =
  | { t: "server-connecting" }
  | { t: "server-connect-error"; errorCount: number }
  | { t: "server-disconnected" }
  | { t: "server-connected" };

export const init: Model = {
  t: "server-connecting",
};

//
//
//
//  Update
//
//
//

export type Msg = ClientWireMsg;

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
  evt?: ClientEvt[];
} => {
  switch (msg.t) {
    case "server-connect-error": {
      return {
        model: {
          t: "server-connect-error",
          errorCount:
            model.t === "server-connect-error" ? model.errorCount + 1 : 1,
        },
      };
    }

    case "server-connected": {
      return {
        model: {
          t: "server-connected",
        },
        evt: [{ t: "server-connected" }],
      };
    }

    case "server-disconnected": {
      return { model: { t: msg.t } };
    }
  }
};

export const updateFromCmd = ({
  msg,
  model,
}: {
  msg: ClientCmd;
  model: Model;
}): {
  model: Model;
} => {
  switch (msg.t) {
    case "send-to-server": {
      return {
        model,
      };
    }
    default: {
      return { model };
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({ model }: { model: Model }) => {
  if (model.t === "server-connect-error" && model.errorCount > 2) {
    return (
      <div className="flex h-6 w-full items-center justify-center gap-2 bg-yellow-600 text-white">
        <IconSpinner className="h-5 w-5 animate-spin text-white" />
        Server disconnected. Trying to reconnect...
      </div>
    );
  }
  if (model.t === "server-disconnected") {
    return (
      <div className="flex h-6 w-full items-center justify-center gap-2 bg-red-500 text-white">
        Server disconnected
      </div>
    );
  }
  return null;
};
