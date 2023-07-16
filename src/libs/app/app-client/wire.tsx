import { ClientAppMsg } from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/core";
import { IconSpinner } from "@gamezilla/ui";

//
//
//
// Model
//
//
//

export type Model =
  | { t: "connecting" }
  | { t: "connect-error"; errorCount: number }
  | { t: "disconnected" }
  | { t: "connected" };

export const init: Model = {
  t: "connecting",
};

//
//
//
//  Update
//
//
//

export type Msg = { t: Model["t"] };

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
  if (msg.t === "connect-error") {
    return {
      model: {
        t: "connect-error",
        errorCount: model.t === "connect-error" ? model.errorCount + 1 : 1,
      },
    };
  }

  if (msg.t === "connected") {
    return {
      model: {
        t: "connected",
      },
      msgs: [{ t: "wire-connected" }],
    };
  }

  return { model: { t: msg.t } };
};

export const updateFromApp = <ToServer,>(input: {
  msg: ClientAppMsg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model: input.model };
};

//
//
//
// View
//
//
//

export const View = ({ model }: { model: Model }) => {
  if (model.t === "connect-error" && model.errorCount > 2) {
    return (
      <div className="flex h-6 w-full items-center justify-center gap-2 bg-blue-500 text-white">
        <IconSpinner className="h-5 w-5 animate-spin text-white" />
        Server disconnected. Reconnecting...
      </div>
    );
  }
  return null;
};
