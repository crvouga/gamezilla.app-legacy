import { err } from "gamezilla/@SHARED/core";
import { IVerifySMS } from "./verify-sms";

export const VerifySMS = (): IVerifySMS => {
  return {
    async sendCode(input) {
      return err("not implemented");
    },
    async verifyCode(input) {
      return err("not implemented");
    },
  };
};
