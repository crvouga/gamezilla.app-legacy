import { err } from "gamezilla/@SHARED/core";
import { SMS } from "../../@SHARED/server/sms-interface";

export const createSMSTwilio = (): SMS => {
  return {
    sendMessage: async (_input) => {
      return err("not-implemented");
    },
  };
};
