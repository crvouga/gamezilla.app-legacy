import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { EmailAddress, PhoneNumber, RemoteResult } from "gamezilla/@SHARED/core"
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core"
// import {
//   StoreSessionIdByUserId,
//   StoreUserIdBySessionId,
// } from "./@SHARED/server/auth-session-store";

//
//
//
//
//
//

export type Account = {
  userId: UserId
  emailAddress?: EmailAddress | null
  phoneNumber?: PhoneNumber | null
}

export type ModelClient = {
  loginWithGoogle: RemoteResult<string, null>
  logout: RemoteResult<string, null>
  currentUser:
    | { t: "loading" }
    | { t: "logged-out" }
    | { t: "logged-in"; userId: UserId; name?: string }
  sms: AuthSMS.ModelClient
}

export type ModelServer = {
  // userIdBySessionId: Store<SessionId, UserId>;
  // sessionIdsByUserId: Store<UserId, { [sessionId: SessionId]: SessionId }>;
  sms: AuthSMS.ModelServer
}

// export const toUserId = async (
//   ctx: ServerCtx,
//   model: ModelServer,
//   sessionId: SessionId
// ): Promise<UserId | null> => {
//   const userId = await StoreUserIdBySessionId(ctx).get(
//     model.userIdBySessionId,
//     sessionId
//   );
//   return userId ?? null;
// };

// export const toSessionIds = async (
//   ctx: ServerCtx,
//   model: ModelServer,
//   userId: UserId
// ): Promise<{ [sessionId: SessionId]: SessionId } | null> => {
//   const sessionIds = await StoreSessionIdByUserId(ctx).get(
//     model.sessionIdsByUserId,
//     userId
//   );
//   console.log("model.sessionIdsByUserId", model.sessionIdsByUserId);
//   return sessionIds ?? null;
// };

//
//
// Msg
//
//

export type MsgClient =
  | { t: "user-clicked-login-with-phone" }
  | { t: "logout"; c: LogoutMsg }
  | { t: "sms"; c: AuthSMS.MsgClient }

export type LogoutMsg =
  | { t: "clicked-confirm" }
  | { t: "clicked-cancel" }
  | { t: "closed" }

export type MsgServer = {
  t: "sms"
  c: AuthSMS.MsgServer
}

export type MsgToServer = { t: "logout" } | { t: "sms"; c: AuthSMS.MsgToServer }

export type MsgToClient =
  | { t: "client-authenticated"; userId: UserId; loggedIn: boolean }
  | { t: "client-unauthenticated" }
  | { t: "sms"; c: AuthSMS.MsgToClient }
