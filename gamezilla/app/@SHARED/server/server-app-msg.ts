import { ClientId, SessionId } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

export type ServerEvent =
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
