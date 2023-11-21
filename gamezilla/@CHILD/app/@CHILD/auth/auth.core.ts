import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  EmailAddress,
  PhoneNumber,
  RemoteResult,
  Result,
} from "gamezilla/@SHARED/core";
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core";
import { Store } from "gamezilla/@SHARED/immutable-store";
import { StoreUserIdBySessionId } from "./@SHARED/server/auth-session-store";

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
  userIdBySessionId: Store<SessionId, UserId>;
  sessionIdByUserId: Store<UserId, SessionId>;
  sms: AuthSMS.ServerModel;
};

export const toCurrentUserId = async (
  model: ServerModel,
  sessionId: SessionId
): Promise<UserId | null> => {
  const userId = await StoreUserIdBySessionId.get(
    model.userIdBySessionId,
    sessionId
  );
  return userId ?? null;
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
  | { t: "auth/client-authenticated"; userId: UserId; loggedIn?: boolean }
  | { t: "auth/client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.ToClient };
