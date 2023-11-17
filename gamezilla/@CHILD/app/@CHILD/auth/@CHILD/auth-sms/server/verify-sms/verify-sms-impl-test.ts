import { PhoneNumber, err, ok } from "gamezilla/@SHARED/core";
import { IVerifySMS } from "./verify-sms";

const CODE = "123";

export const VerifySMS = (): IVerifySMS => {
  return {
    async sendCode(input) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        `[verify-sms] [test] fake sent code to ${PhoneNumber.toString(
          input.phoneNumber
        )}. code: ${CODE}`
      );

      return ok(null);
    },
    async verifyCode(input) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (input.code === CODE) {
        return ok(null);
      }

      return err("Code does match expected value");
    },
  };
};
