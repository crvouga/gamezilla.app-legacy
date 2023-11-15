import { ClientId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Iso3166Alpha2Code,
  PhoneNumber,
  RemoteResult,
  Result,
} from "gamezilla/@SHARED/core";

export type ServerModel = {
  verifications: {
    [id: string]: {
      verify: RemoteResult<string, null>;
      phoneNumber: PhoneNumber;
    };
  };
};

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
  code: string | null;
  //
  sendCode: RemoteResult<string, null>;
  verifyCode: RemoteResult<string, null>;
};

export type ClientMsg =
  | { t: "inputted-phone-number"; phoneNumber: string }
  | { t: "inputted-country-code"; countryCode: Iso3166Alpha2Code }
  | { t: "clicked-send-code" }
  | { t: "inputted-code"; code: string }
  | { t: "clicked-verify-code" };

type SentCode = {
  t: "sent-code";
  phoneNumber: PhoneNumber;
  result: Result<string, null>;
};

export type ServerMsg =
  | (SentCode & { clientId: ClientId })
  | {
      t: "verified-code";
      phoneNumber: PhoneNumber;
      code: string;
    };

export type ToServer = {
  t: "send-code";
  phoneNumber: PhoneNumber;
};

export type ToClient = SentCode;
