import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerEvt =
  | {
      t: "client-connected";
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
    }
  | {
      t: "client-disconnected";
      clientId: ClientId;
      sessionId: SessionId;
    }
  | {
      t: "client-authenticated";
      userId: UserId;
      sessionId: SessionId;
      clientId: ClientId;
      loggedIn?: boolean;
    }
  | {
      t: "client-unauthenticated";
      sessionId: SessionId;
      clientId: ClientId;
    };

export const connectedClientAuthenticated = (
  sessionId: SessionId,
  clientId: ClientId,
  userId: UserId,
  loggedIn?: boolean
): ServerEvt => {
  return {
    t: "client-authenticated",
    sessionId,
    clientId,
    userId,
    loggedIn,
  };
};

export const connectedClientLoggedIn = (
  sessionId: SessionId,
  clientId: ClientId,
  userId: UserId
): ServerEvt => {
  return {
    t: "client-authenticated",
    sessionId,
    clientId,
    userId,
    loggedIn: true,
  };
};

export const connectedClientUnauthenticated = (
  sessionId: SessionId,
  clientId: ClientId
): ServerEvt => {
  return {
    t: "client-unauthenticated",
    sessionId,
    clientId,
  };
};

export const clientConnected = (
  sessionId: SessionId,
  clientId: ClientId,
  userId?: UserId
): ServerEvt => {
  return {
    t: "client-connected",
    sessionId,
    clientId,
    userId,
  };
};
