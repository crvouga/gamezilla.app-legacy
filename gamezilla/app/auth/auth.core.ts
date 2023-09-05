import {
  PhoneNumber,
  RemoteResult,
  Result,
  SessionId,
} from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import { AuthEmailLink, AuthPhone, AuthPhoneVerify } from "./auth-client";

export type ClientModel = {
  currentUser:
    | { t: "not-asked" }
    | { t: "loading" }
    | { t: "logged-in-client-side"; userId: UserId; name?: string }
    | { t: "logged-out-client-side" }
    | { t: "logged-out" }
    | { t: "logged-in"; userId: UserId; name?: string };
  requests: {
    [key in Req["t"]]?: RemoteResult<string, null>;
  };
  phone: AuthPhone.Model;
  phoneVerify: AuthPhoneVerify.Model;
  emailLink: AuthEmailLink.Model;
};

export type ServerModel = {
  sessions: {
    [sessionId: SessionId]: {
      sessionId: SessionId;
      userId: UserId;
    };
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

type Event =
  | { t: "client-authenticated"; userId: UserId }
  | { t: "client-unauthenticated" };

export type ClientMsg =
  | Req
  | Event
  | { t: "login-done"; result: Result<string, null> }
  | { t: "logout-done"; result: Result<string, null> }
  | { t: "phone"; c: AuthPhone.Msg }
  | { t: "phone-verify"; c: AuthPhoneVerify.Msg }
  | { t: "email-link"; c: AuthEmailLink.Msg };

export type ServerMsg = { t: "none" };

export type ToServer = Req | Event;

export type ToClient = Res | { t: "acknowledged"; msg: ToServer };

export type Req =
  | { t: "logout" }
  | { t: "login-with-google" }
  | { t: "send-code"; phoneNumber: PhoneNumber }
  | { t: "verify-code"; phoneNumber: PhoneNumber; code: number };

export type Res = Req & { result: Result<string, null> };
