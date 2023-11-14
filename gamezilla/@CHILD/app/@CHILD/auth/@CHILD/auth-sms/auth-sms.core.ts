import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { PhoneNumber, RemoteResult } from "gamezilla/@SHARED/core";

export type ServerModel = {
  verifications: {
    [id: string]: VerificationState;
  };
};

type VerificationState =
  | {
      t: "initial";
    }
  | {
      t: "sending-code";
      phoneNumber: PhoneNumber;
    }
  | {
      t: "send-code-error";
      phoneNumber: PhoneNumber;
      error: string;
    }
  | {
      t: "verify-code";
    }
  | {
      t: "verifying-code";
      phoneNumber: PhoneNumber;
      code: string;
    }
  | {
      t: "verify-code-error";
      phoneNumber: PhoneNumber;
      code: string;
      error: string;
    }
  | {
      t: "verified";
      phoneNumber: PhoneNumber;
      code: string;
      userId: UserId;
    };

export type Route =
  | {
      t: "";
    }
  | {
      t: "verify";
      phoneNumber: PhoneNumber;
    };

export type ClientModelV2 = {
  //
  phoneNumberInput: string;
  //
  codeInput: string;
  code: string | null;
  //
  sendCode: RemoteResult<string, null>;
  verifyCode: RemoteResult<string, null>;
};

export type ClientModel =
  | {
      t: "input-phone-number";
      phoneNumberInput: string;
    }
  | {
      t: "sending-code";
      phoneNumberInput: string;
      phoneNumber: PhoneNumber;
    }
  | {
      t: "send-code-error";
      phoneNumberInput: string;
      phoneNumber: PhoneNumber;
      error: string;
    }
  | {
      t: "input-code";
      phoneNumberInput: string;
      phoneNumber: PhoneNumber;
      codeInput: string;
    }
  | {
      t: "verifying-code";
      phoneNumber: PhoneNumber;
      code: string;
    }
  | {
      t: "verify-code-error";
      phoneNumber: PhoneNumber;
      code: string;
      error: string;
    }
  | {
      t: "verified";
      phoneNumber: PhoneNumber;
      code: string;
      userId: UserId;
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
