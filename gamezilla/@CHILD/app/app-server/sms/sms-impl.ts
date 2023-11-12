import { SMS } from "../../@SHARED/server/sms-interface";
import { createSMSTwilio } from "./sms-impl-twilio";

export const createSMS = (impl: "twilio"): SMS => {
  return createSMSTwilio();
};
