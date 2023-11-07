import {
  ClientId,
  EmailAddress,
  RemoteResult,
  Result,
  SessionId,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

export type Account = {
  userId: UserId;
  emailAddress: EmailAddress;
};

export type ClientModel = {
  loginWithGoogle: RemoteResult<string, null>;
  logout: RemoteResult<string, null>;
  currentUser:
    | { t: "loading" }
    | { t: "logged-out" }
    | { t: "logged-in"; userId: UserId; name?: string };
};

export type SocialLoginState =
  | {
      t: "in-progress";
      sessionId: SessionId;
    }
  | {
      t: "done";
      sessionId: SessionId;
      emailAddress: EmailAddress | null;
    };

export type ServerModel = {
  sessions: {
    [sessionId: SessionId]: {
      sessionId: SessionId;
      userId: UserId;
    };
  };

  socialLoginStates: {
    [sessionId: SessionId]: SocialLoginState;
  };
};

//
//
// Msg
//
//

export type ClientMsg =
  | { t: "clicked-logout" }
  | { t: "clicked-login-with-google" }
  | {
      t: "got-social-login-result";
      result: RemoteResult<string, EmailAddress>;
    };

export type ServerMsg = {
  t: "got-user-account";
  result: Result<string, Account>;
  sessionId: SessionId;
  clientId: ClientId;
};

export type ToServer =
  | { t: "logout" }
  | { t: "started-social-login" }
  | {
      t: "got-social-login-result";
      result: RemoteResult<string, EmailAddress>;
    };

export type ToClient =
  | { t: "client-authenticated"; userId: UserId; loggedIn?: boolean }
  | { t: "client-unauthenticated" }
  | { t: "get-social-login-result" };
