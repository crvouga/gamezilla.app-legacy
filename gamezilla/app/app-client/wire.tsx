import { ClientWireMsg, Eff } from "gamezilla/@SHARED/core";
import { ClientAppMsg } from "gamezilla/app/@SHARED/client";
import { IconSpinner } from "gamezilla/app/@SHARED/ui";

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
  msgs?: ClientAppMsg[];
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
        msgs: [{ t: "server-connected" }],
      };
    }

    case "server-disconnected": {
      return { model: { t: msg.t } };
    }
  }
};

export const updateFromEvent = <ToServer,>({
  model,
  msg,
}: {
  msg: ClientAppMsg;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
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
      <div className="flex h-6 w-full items-center justify-center gap-2 bg-blue-500 text-white">
        <IconSpinner className="h-5 w-5 animate-spin text-white" />
        Server disconnected. Reconnecting...
      </div>
    );
  }
  return null;
};
