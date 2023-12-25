import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerEvent =
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
      t: "auth/connected-client-is-logged-in";
      userId: UserId;
      sessionId: SessionId;
      clientId: ClientId;
      loggedIn?: boolean;
    }
  | {
      t: "connected-client-is-logged-out";
      sessionId: SessionId;
      clientId: ClientId;
    };
