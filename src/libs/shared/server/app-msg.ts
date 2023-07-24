import { ClientId, SessionId, UserId } from "@gamezilla/shared/app";

//
//
//
//
//
//

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
