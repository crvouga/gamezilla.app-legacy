import { err } from "gamezilla/@SHARED/core";
import { SMS } from "./sms-interface";

export const createSMSTwilio = (): SMS => {
  return {
    sendMessage: async (input) => {
      return err("not-implemented");
    },
  };
};
