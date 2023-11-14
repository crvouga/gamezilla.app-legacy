import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { PhoneNumber, RemoteResult } from "gamezilla/@SHARED/core";

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
  //
  codeInput: string;
  code: string | null;
  //
  sendCode: RemoteResult<string, null>;
  verifyCode: RemoteResult<string, null>;
};

export type ClientMsg =
  | { t: "inputted-phone-number"; phoneNumber: string }
  | { t: "clicked-send-code" }
  | { t: "inputted-code"; error: string }
  | { t: "clicked-verify-code" };

export type ServerMsg =
  | {
      t: "sent-code";
      phoneNumber: PhoneNumber;
    }
  | {
      t: "verified-code";
      phoneNumber: PhoneNumber;
      code: string;
    };

export type ToServer = { t: null };

export type ToClient = { t: null };
