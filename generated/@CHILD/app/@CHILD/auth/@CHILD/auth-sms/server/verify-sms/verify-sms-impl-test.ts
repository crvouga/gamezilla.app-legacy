import { PhoneNumber, err, ok } from "gamezilla-app/@SHARED/core";
import { IVerifySMS } from "./verify-sms";
import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger";
const CODE = "123";
export const VerifySMS = ({ logger, delay, }: {
    logger: Logger;
    delay: () => Promise<void>;
}): IVerifySMS => {
    return {
        async sendCode(input) {
            await delay();
            const phoneNumberStr = PhoneNumber.toString(input.phoneNumber);
            logger.info(`[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${CODE}`);
            return ok(null);
        },
        async verifyCode(input) {
            await delay();
            if (input.code === CODE) {
                return ok(null);
            }
            return err("Code does not match the code sent");
        },
    };
};
