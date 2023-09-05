import { PhoneNumber, RemoteResult, SessionId } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

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
      userId: UserId | null;
    };

export type ServerModel = {
  sessions: {
    [sessionId: SessionId]: {
      sessionId: SessionId;
      userId: UserId;
    };
  };

  socialLogin: {
    [sessionId: SessionId]: SocialLoginState;
  };

  verifications: {
    [requestId: string]: {
      requestId: string;
      phoneNumber: PhoneNumber;
      code: number;
    };
  };
};

//
//
// Msg
//
//

export type ClientMsg =
  | { t: "logout" }
  | { t: "login-with-google" }
  | { t: "got-social-login-result"; result: RemoteResult<string, UserId> };

export type ServerMsg = { t: null };

export type ToServer =
  | { t: "logout" }
  | { t: "started-social-login" }
  | { t: "got-social-login-result"; result: RemoteResult<string, UserId> };

export type ToClient =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" }
  | { t: "get-social-login-result" };
