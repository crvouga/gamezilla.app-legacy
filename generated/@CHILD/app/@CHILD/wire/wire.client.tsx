import { ClientCmd, ClientEvent, showToast, } from "gamezilla-app/@CHILD/app/@SHARED/client";
import { Eff, Sub } from "gamezilla-app/@SHARED/core";
import { ListItemButton, cn } from "../../@SHARED/ui";
import { IClientTransport } from "./transport-client";
import { ModelClient, MsgClient, MsgToClient } from "./wire.core";
//
//
//
// Model
//
//
//
export const init = (_input: {
    stored: Record<string, unknown> | null;
}): {
    model: ModelClient;
} => {
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
export const update = <TMsgToClient, TMsgToServer>({ msg, msgServer, msgCmd, model, transport, }: {
    msg?: MsgClient | null;
    msgServer?: MsgToClient | null;
    msgCmd?: ClientCmd<{
        MsgClient: MsgClient;
        MsgToServer: TMsgToServer;
    }> | null;
    model: ModelClient;
    transport: IClientTransport<{
        MsgToServer: TMsgToServer;
        MsgToClient: TMsgToClient;
    }>;
}): {
    model: ModelClient;
    msgEvt?: ClientEvent[];
    eff?: Eff<MsgClient>;
} => {
    if (msg) {
        return updateFromMsg({ msg, model, transport });
    }
    if (msgServer) {
        return updateFromServer({ model, msgServer, transport });
    }
    if (msgCmd) {
        return updateFromCmd({
            msgCmd,
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
                        errorCount: model.state.t === "server-connect-error"
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
                msgEvt: [{ t: "wire/server-connected" }],
            };
        }
        case "server-disconnected": {
            return { model: { ...model, state: { t: msg.t } } };
        }
        case "clicked-try-reconnect": {
            return {
                model: { ...model, state: { t: "server-connecting" } },
                eff: () => {
                    transport.msgCmd.publish({ t: "try-reconnect" });
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
const updateFromServer: typeof update = ({ model, msgServer }) => {
    if (!msgServer) {
        return { model };
    }
    switch (msgServer.t) {
        case "server-restarted": {
            return {
                model,
                msgCmd: [showToast("Server restarted")],
            };
        }
    }
};
const updateFromCmd: typeof update = ({ msgCmd, model, transport }) => {
    if (!msgCmd) {
        return { model };
    }
    const wireCmd = msgCmd.c;
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
export const ViewStatusBar = ({ model }: {
    model: ModelClient;
}) => {
    switch (model.state.t) {
        case "server-connected": {
            return <span className="h-2 w-2 rounded-full bg-green-500"></span>;
        }
        case "server-connecting":
        case "server-connect-error": {
            return (<div className="flex animate-pulse items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          <p className="text-orange-500">Connecting...</p>
        </div>);
        }
        case "server-disconnected": {
            return (<div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          <p className="text-red-500">Offline</p>
        </div>);
        }
    }
};
export const ViewStatusBarDrawer = ({ model, dispatch, }: {
    model: ModelClient;
    dispatch: (m: MsgClient) => void;
}) => {
    switch (model.state.t) {
        case "server-connected": {
            return (<ListItemButton icon={(props) => (<span className={cn(props.className, "rounded-full bg-green-500")}/>)} className="text-green-500" label="Online"/>);
        }
        case "server-connect-error":
        case "server-connecting": {
            return (<ListItemButton icon={(props) => (<span className={cn(props.className, "rounded-full bg-orange-500")}/>)} color="warning" label="Connecting..."/>);
        }
        case "server-disconnected": {
            return (<ListItemButton icon={(props) => (<span className={cn(props.className, "rounded-full bg-red-500")}/>)} color="danger" label="Offline" end={() => {
                    return (<button onClick={() => dispatch({ t: "clicked-try-reconnect" })} className="font-bold text-red-500">
                Try reconnect
              </button>);
                }}/>);
        }
    }
};
//
//
//
//
//
//
export const subscriptions = <MsgToServer, MsgToClient>({ transport, }: {
    transport: IClientTransport<{
        MsgToServer: MsgToServer;
        MsgToClient: MsgToClient;
    }>;
}): Sub<MsgClient> => {
    return transport.msgEvt;
};
