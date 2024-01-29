import { ClientId, SessionId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Iso3166Alpha2Code,
  PhoneNumber,
  Posix,
  RemoteResult,
  Result,
} from "gamezilla/@SHARED/core";

export type ServerModel = null;

export type Route =
  | {
      t: "/";
    }
  | {
      t: "/verify";
      phoneNumber: PhoneNumber;
    };

export type ClientModel = {
  //
  phoneNumberInput: string;
  phoneNumberError: string | null;
  countryCodeInput: Iso3166Alpha2Code;
  //
  codeInput: string;
  codeError: string | null;
  //
  sentCodeAt: Posix | null;
  sendCode: RemoteResult<string, null>;
  //
  verifiedCodeAt: Posix | null;
  verifyCode: RemoteResult<string, null>;
};

export type ClientMsg =
  | { t: "clicked-back-button" }
  | { t: "inputted-phone-number"; phoneNumber: string }
  | { t: "inputted-country-code"; countryCode: Iso3166Alpha2Code }
  | { t: "clicked-phone-number-clear" }
  | { t: "clicked-send-code" }
  | { t: "inputted-code"; code: string }
  | { t: "clicked-code-clear" }
  | { t: "clicked-verify-code"; phoneNumber: PhoneNumber }
  | { t: "time-passed"; now: Posix };

type SentCode = {
  t: "sent-code";
  phoneNumber: PhoneNumber;
  result: Result<string, null>;
};

type VerifiedCode = {
  t: "verified-code";
  phoneNumber: PhoneNumber;
  result: Result<string, null>;
};

export type ServerMsg =
  | (SentCode & { clientId: ClientId })
  | (VerifiedCode & { clientId: ClientId; sessionId: SessionId });

export type MsgToServer =
  | {
      t: "send-code";
      phoneNumber: PhoneNumber;
    }
  | {
      t: "verify-code";
      phoneNumber: PhoneNumber;
      code: string;
    };

export type MsgToClient = SentCode | VerifiedCode;
