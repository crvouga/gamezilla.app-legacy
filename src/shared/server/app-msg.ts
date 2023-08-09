import { ClientId, SessionId } from "src/core";
import { UserId } from "src/shared/app";

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
