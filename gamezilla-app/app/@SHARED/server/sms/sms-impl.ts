import type { ILogger } from "../logger/logger";
import type { ISMS } from "./sms";
import { SMSTwilio } from "./sms-impl-twilio";

export type SMSImpl = {
	t: "twilio";
	logger: ILogger;
};

export const SMS = (impl: SMSImpl): ISMS => {
	return SMSTwilio(impl);
};
