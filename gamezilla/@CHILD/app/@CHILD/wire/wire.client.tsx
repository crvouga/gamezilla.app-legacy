import {
  ClientCmd,
  ClientEvent,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { IClientTransport } from "./transport-client";
import { ClientModel, ClientMsg, ToClient } from "./wire.core";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): { model: ClientModel } => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      state: {
        t: "server-connecting",
      },
      serverTime: null,
    },
  };
};

//
//
//
//  Update
//
//
//

export const update = <TToClient, TToServer>({
  msg,
  msgFromServer,
  cmd,
  model,
  transport,
}: {
  msg?: ClientMsg | null;
  msgFromServer?: ToClient | null;
  cmd?: ClientCmd<{ ClientMsg: ClientMsg; ToServer: TToServer }> | null;
  model: ClientModel;
  transport: IClientTransport<{
    ToServer: TToServer;
    ToClient: TToClient;
  }>;
}): {
  model: ClientModel;
  msgEvent?: ClientEvent[];
  eff?: Eff<ClientMsg>;
} => {
  if (msg) {
    return updateFromMsg({ msg, model, transport });
  }

  if (msgFromServer) {
    return updateFromServer({ model, msgFromServer, transport });
  }

  if (cmd) {
    return updateFromCmd({
      cmd,
      model,
      transport,
    });
  }

  return { model };
};

const updateFromMsg: typeof update = ({ msg, model, transport }) => {
  if (!msg) {
    return { model };
  }

  switch (msg.t) {
    case "server-connect-error": {
      return {
        model: {
          ...model,
          state: {
            t: "server-connect-error",
            errorCount:
              model.state.t === "server-connect-error"
                ? model.state.errorCount + 1
                : 1,
          },
        },
      };
    }

    case "server-connected": {
      return {
        model: {
          ...model,
          state: {
            t: "server-connected",
          },
        },
        msgEvent: [{ t: "wire/server-connected" }],
      };
    }

    case "server-disconnected": {
      return { model: { ...model, state: { t: msg.t } } };
    }

    case "clicked-try-reconnect": {
      return {
        model: { ...model, state: { t: "server-connecting" } },
        eff: () => {
          transport.cmd.publish({ t: "try-reconnect" });
        },
      };
    }

    case "got-bad-msgs": {
      switch (msg.reason) {
        case "codebase-version-mismatch": {
          return {
            model,
          };
        }
      }
    }
  }
};

const updateFromServer: typeof update = ({ model, msgFromServer }) => {
  if (!msgFromServer) {
    return { model };
  }

  switch (msgFromServer.t) {
    case "server-restarted": {
      return {
        model,
        cmd: [showToast("Server restarted")],
      };
    }
  }
};

const updateFromCmd: typeof update = ({ cmd, model, transport }) => {
  if (!cmd) {
    return { model };
  }

  const wireCmd = cmd.c;

  switch (wireCmd.t) {
    case "send-to-server": {
      return {
        model,
        eff: () => {
          if (wireCmd.msg) {
            transport.toServer.publish([wireCmd.msg]);
          }
        },
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

export const ViewStatusBar = ({ model }: { model: ClientModel }) => {
  switch (model.state.t) {
    case "server-connected": {
      return <span className="h-2 w-2 rounded-full bg-green-500"></span>;
    }

    case "server-connecting":
    case "server-connect-error": {
      return (
        <div className="flex animate-pulse items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          <p className="text-orange-500">Connecting...</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <p className="text-red-500">Offline</p>
        </div>
      );
    }
  }
};

export const ViewStatusBarDrawer = ({
  model,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  switch (model.state.t) {
    case "server-connected": {
      return (
        <div className="flex w-full items-center gap-4 p-4">
          <span className="h-5 w-5 rounded-full bg-green-500"></span>

          <p className="text-green-500">Online</p>
        </div>
      );
    }

    case "server-connect-error":
    case "server-connecting": {
      return (
        <div className="flex w-full animate-pulse items-center gap-4 p-4">
          <span className="h-5 w-5 rounded-full bg-orange-500"></span>
          <p className="text-orange-500">Connecting...</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div className="flex w-full items-center gap-4 p-4">
          <span className="h-5 w-5 rounded-full bg-red-500"></span>
          <p className="flex-1 text-red-500">Offline</p>
          <button
            onClick={() => dispatch({ t: "clicked-try-reconnect" })}
            className="font-bold text-red-500"
          >
            Try reconnect
          </button>
        </div>
      );
    }
  }
};

//
//
//
//
//
//

export const subscriptions = <ToServer, ToClient>({
  transport,
}: {
  transport: IClientTransport<{ ToServer: ToServer; ToClient: ToClient }>;
}): Sub<ClientMsg> => {
  return transport.msgEvent;
};
