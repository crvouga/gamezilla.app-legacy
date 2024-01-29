import { Posix } from "gamezilla/@SHARED/core";
import { ClientId, SessionId, UserId } from "../../@SHARED/data";
import { ClientTransportEvent } from "./transport-client";
import { ServerTransportMsg } from "./transport-server";
import { CappedOrderedDict } from "gamezilla/@SHARED/data-structures/capped-ordered-dict";

//
//
//
//
//
//

export type ClientModel = {
  state:
    | { t: "server-connecting" }
    | { t: "server-connect-error"; errorCount: number }
    | { t: "server-disconnected" }
    | { t: "server-connected" };

  serverTime: {
    serverNow: Posix;
    recordedAt: Posix;
  } | null;
};

export type ClientMsg = ClientTransportEvent | { t: "clicked-try-reconnect" };

export type ServerModel = {
  clientsBySessionId: {
    [sessionId: SessionId]: Client;
  };
  sessionIdsByUserId: {
    [userId: UserId]: SessionId[];
  };
  serverStartedAt: Posix | null;
};

export type Client = {
  sessionId: SessionId;
  clientIds: CappedOrderedDict<ClientId, ClientId>;
};

export type ServerMsg = ServerTransportMsg;

//
//
//
//
//
//

export type MsgToServer = { t: null };

export type MsgToClient = { t: "server-restarted" };
