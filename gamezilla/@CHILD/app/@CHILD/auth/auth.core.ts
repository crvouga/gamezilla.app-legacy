import {
  EmailAddress,
  PhoneNumber,
  RemoteResult,
  Result,
} from "gamezilla/@SHARED/core";
import { ClientId, SessionId, UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import * as AuthSMS from "./@CHILD/auth-sms/auth-sms.core";

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
  sms: AuthSMS.ClientModel;
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

  sms: AuthSMS.ServerModel;
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
    }
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

export type ToServer =
  | { t: "logout" }
  | { t: "started-social-login" }
  | {
      t: "got-social-login-result";
      result: RemoteResult<string, EmailAddress>;
    }
  | {
      t: "sms";
      c: AuthSMS.ToServer;
    };

export type ToClient =
  | { t: "client-authenticated"; userId: UserId; loggedIn?: boolean }
  | { t: "client-unauthenticated" }
  | { t: "get-social-login-result" }
  | {
      t: "sms";
      c: AuthSMS.ToClient;
    };

export type Req =
  | {
      t: "send-sms-code";
      phoneNumber: PhoneNumber;
    }
  | {
      t: "verify-sms-code";
      phoneNumber: PhoneNumber;
    };

export type Res =
  | {
      t: "sent-sms-code";
      phoneNumber: PhoneNumber;
    }
  | {
      t: "verified-sms-code";
      phoneNumber: PhoneNumber;
      result: Result<string, { userId: UserId }>;
    };
