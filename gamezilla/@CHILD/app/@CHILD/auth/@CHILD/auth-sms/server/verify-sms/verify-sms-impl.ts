import { err } from "gamezilla/@SHARED/core";
import { IVerifySMS } from "./verify-sms";
import * as ImplTest from "./verify-sms-impl-test";
import * as ImplTwilio from "./verify-sms-impl-twilio";

export const VerifySMS = (impl: "test" | "twilio"): IVerifySMS => {
  switch (impl) {
    case "test": {
      return ImplTest.VerifySMS();
    }
    case "twilio": {
      return ImplTwilio.VerifySMS();
    }
  }
};
