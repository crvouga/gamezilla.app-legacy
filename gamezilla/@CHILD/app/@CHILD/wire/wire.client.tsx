import {
  ClientCmd,
  ClientEvt,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { Eff, Sub } from "gamezilla/@SHARED/core";
import { IClientTransport } from "./transport-client";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./wire.core";

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
  model,
  transport,
}: {
  msg: ClientMsg;
  model: ClientModel;
  transport: IClientTransport<{
    ToServer: TToServer;
    ToClient: TToClient;
  }>;
}): {
  model: ClientModel;
  evt?: ClientEvt[];
  eff?: Eff<ClientMsg>;
} => {
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
        evt: [{ t: "wire/server-connected" }],
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
  }
};

export const updateFromServer = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ToClient;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "server-restarted": {
      return {
        model,
        cmd: [showToast("Server restarted")],
      };
    }
  }
};

export const updateFromCmd = <TToServer, TToClient>({
  cmd,
  model,
  transport,
}: {
  cmd: ClientCmd<{ ClientMsg: never; ToServer: TToServer }>;
  model: ClientModel;
  transport: IClientTransport<{
    ToServer: TToServer;
    ToClient: TToClient;
  }>;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
} => {
  switch (cmd.t) {
    case "wire/send-to-server": {
      return {
        model,
        eff: () => {
          if (cmd.msg) {
            transport.toServer.publish([cmd.msg]);
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
      return <span class="h-2 w-2 rounded-full bg-green-500"></span>;
    }

    case "server-connecting":
    case "server-connect-error": {
      return (
        <div class="flex animate-pulse items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-orange-500"></span>
          <p class="text-orange-500">Connecting...</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div class="flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-red-500"></span>
          <p class="text-red-500">Offline</p>
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
        <div class="flex w-full items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-green-500"></span>

          <p class="text-green-500">Online</p>
        </div>
      );
    }

    case "server-connect-error":
    case "server-connecting": {
      return (
        <div class="flex w-full animate-pulse items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-orange-500"></span>
          <p class="text-orange-500">Connecting...</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div class="flex w-full items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-red-500"></span>
          <p class="flex-1 text-red-500">Offline</p>
          <button
            onClick={() => dispatch({ t: "clicked-try-reconnect" })}
            class="font-bold text-red-500"
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
  return transport.evt;
};
