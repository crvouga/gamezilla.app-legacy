import { SMS } from "../../@SHARED/server/sms-interface";
import { createSMSTwilio } from "./sms-impl-twilio";

export const createSMS = (_impl: "twilio"): SMS => {
  return createSMSTwilio();
};
