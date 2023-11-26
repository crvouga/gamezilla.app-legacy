import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerEvt =
  | {
      t: "wire/client-connected";
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
    }
  | {
      t: "wire/client-disconnected";
      clientId: ClientId;
      sessionId: SessionId;
    }
  | {
      t: "auth/connected-client-authenticated";
      userId: UserId;
      sessionId: SessionId;
      clientId: ClientId;
      loggedIn?: boolean;
    }
  | {
      t: "auth/connected-client-unauthenticated";
      sessionId: SessionId;
      clientId: ClientId;
    };
