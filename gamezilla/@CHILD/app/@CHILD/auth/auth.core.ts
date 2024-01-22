import { SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { ServerCtx } from "gamezilla/@CHILD/app/@SHARED/server";
import {
  EmailAddress,
  PhoneNumber,
  RemoteResult,
} from "gamezilla/@SHARED/core";
import { Store } from "gamezilla/@SHARED/immutable-store";
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core";
import {
  StoreSessionIdByUserId,
  StoreUserIdBySessionId,
} from "./@SHARED/server/auth-session-store";

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
  sessionIdsByUserId: Store<UserId, { [sessionId: SessionId]: SessionId }>;
  sms: AuthSMS.ServerModel;
};

export const toUserId = async (
  ctx: ServerCtx,
  model: ServerModel,
  sessionId: SessionId
): Promise<UserId | null> => {
  const userId = await StoreUserIdBySessionId(ctx).get(
    model.userIdBySessionId,
    sessionId
  );
  return userId ?? null;
};

export const toSessionIds = async (
  ctx: ServerCtx,
  model: ServerModel,
  userId: UserId
): Promise<{ [sessionId: SessionId]: SessionId } | null> => {
  const sessionIds = await StoreSessionIdByUserId(ctx).get(
    model.sessionIdsByUserId,
    userId
  );
  return sessionIds ?? null;
};

//
//
// Msg
//
//

export type ClientMsg =
  | { t: "user-clicked-login-with-phone" }
  | { t: "logout"; c: LogoutMsg }
  | { t: "sms"; c: AuthSMS.ClientMsg };

export type LogoutMsg =
  | { t: "clicked-confirm" }
  | { t: "clicked-cancel" }
  | { t: "closed" };

export type ServerMsg = {
  t: "sms";
  c: AuthSMS.ServerMsg;
};

export type ToServer = { t: "logout" } | { t: "sms"; c: AuthSMS.ToServer };

export type ToClient =
  | { t: "client-authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.ToClient };
