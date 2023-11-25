import {
  ClientCmd,
  ClientEvt,
  showToast,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { IconSpinner } from "gamezilla/@CHILD/app/@SHARED/ui";
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
      t: "server-connecting",
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

export const update = ({
  msg,
  model,
}: {
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
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
        evt: [{ t: "wire/server-connected" }],
      };
    }

    case "server-disconnected": {
      return { model: { t: msg.t } };
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
      return { model };
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
  switch (model.t) {
    case "server-connected": {
      return <span class="h-2 w-2 rounded-full bg-green-500"></span>;
    }

    case "server-connecting": {
      return (
        <div>
          <span class="h-2 w-2 rounded-full bg-orange-500"></span>
          <p>Connecting...</p>
        </div>
      );
    }

    case "server-connect-error": {
      return (
        <div>
          <span class="h-2 w-2 rounded-full bg-orange-500"></span>
          <p>Connecting...</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div>
          <span class="h-2 w-2 rounded-full bg-red-500"></span>
          <p>Disconnected</p>
        </div>
      );
    }
  }
};

export const ViewStatusBarDrawer = ({ model }: { model: ClientModel }) => {
  switch (model.t) {
    case "server-connected": {
      return (
        <div class="flex w-full items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-green-500"></span>
          <p class="text-green-500">Server connected</p>
        </div>
      );
    }

    case "server-connect-error":
    case "server-connecting": {
      return (
        <div class="flex w-full items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-orange-500"></span>
          <p>Server connecting</p>
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div class="flex w-full items-center gap-4 p-4">
          <span class="h-5 w-5 rounded-full bg-red-500"></span>
          <p>Offline</p>
        </div>
      );
    }
  }
};

export const View = ({ model }: { model: ClientModel }) => {
  switch (model.t) {
    case "server-connect-error": {
      if (model.errorCount === 0) {
        return null;
      }
      return (
        <div class="flex h-6 w-full items-center justify-center gap-4 bg-yellow-600 text-white">
          <IconSpinner class="h-5 w-5 animate-spin text-white" />
          Server disconnected. Trying to reconnect...
        </div>
      );
    }

    case "server-disconnected": {
      return (
        <div class="flex h-6 w-full items-center justify-center gap-4 bg-red-500 text-white">
          Server disconnected
        </div>
      );
    }

    default: {
      return null;
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
  return transport.wire;
};
