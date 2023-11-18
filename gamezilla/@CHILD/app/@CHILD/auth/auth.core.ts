import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  EmailAddress,
  PhoneNumber,
  RemoteResult,
  Result,
} from "gamezilla/@SHARED/core";
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core";

//
//
//
//
//
//

export type Account = {
  userId: UserId;
  emailAddress?: EmailAddress | null;
  phoneNumber?: PhoneNumber | null;
};

export type ClientModel = {
  loginWithGoogle: RemoteResult<string, null>;
  logout: RemoteResult<string, null>;
  currentUser:
    | { t: "loading" }
    | { t: "logged-out" }
    | { t: "logged-in"; userId: UserId; name?: string };
  sms: AuthSMS.ClientModel;
};

export type ServerModel = {
  userIdBySessionId: { [sessionId: SessionId]: UserId };
  sessionIdByUserId: { [userId: UserId]: SessionId };
  sms: AuthSMS.ServerModel;
};

//
//
// Msg
//
//

export type ClientMsg =
  | { t: "clicked-logout" }
  | { t: "sms"; c: AuthSMS.ClientMsg };

export type ServerMsg =
  | {
      t: "got-user-account";
      result: Result<string, Account>;
      sessionId: SessionId;
      clientId: ClientId;
    }
  | {
      t: "sms";
      c: AuthSMS.ServerMsg;
    };

export type ToServer = { t: "logout" } | { t: "sms"; c: AuthSMS.ToServer };

export type ToClient =
  | { t: "client-authenticated"; userId: UserId; loggedIn?: boolean }
  | { t: "client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.ToClient };
