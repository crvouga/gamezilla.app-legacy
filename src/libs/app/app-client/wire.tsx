import { AppMsg } from "@gamezilla/shared/client";
import { Cmd } from "@gamezilla/shared/core";
import { IconSpinner } from "@gamezilla/shared/ui";

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
  msgs?: AppMsg[];
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
  msg: AppMsg;
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
      <div className="w-full flex items-center justify-center text-white bg-blue-500 gap-2 h-6">
        <IconSpinner className="w-5 h-5 text-white animate-spin" />
        Reconnecting to server...
      </div>
    );
  }
  return null;
};
