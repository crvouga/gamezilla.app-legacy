import { ClientId, SessionId } from "gamezilla/@/core";
import { UserId } from "gamezilla/app/@";

export type ServerAppMsg =
  | {
      t: "client-connected";
      clientId: ClientId;
      sessionId: SessionId;
      userId?: UserId;
    }
  | {
      t: "client-authenticated";
      userId: UserId;
      clientId: ClientId;
    };
