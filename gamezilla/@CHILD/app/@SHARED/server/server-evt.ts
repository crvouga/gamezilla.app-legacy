import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";

export type ServerEvt =
  | {
      t: "client-connected";
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
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
