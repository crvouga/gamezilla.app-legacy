import { ClientWireMsg, Cmd } from "src/core";
import { ClientAppMsg } from "src/app/@shared/client";
import { IconSpinner } from "src/app/@shared/ui";

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
  if (msg.t === "server-connect-error") {
    return {
      model: {
        t: "server-connect-error",
        errorCount:
          model.t === "server-connect-error" ? model.errorCount + 1 : 1,
      },
    };
  }

  if (msg.t === "server-connected") {
    return {
      model: {
        t: "server-connected",
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
