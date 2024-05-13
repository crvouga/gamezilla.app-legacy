import type { ILogger } from "../logger/logger";
import type { ISMS } from "./sms";
import { SMSFake } from "./sms-impl-fake";
import { SMSTwilio } from "./sms-impl-twilio";

export type SMSImpl =
	| {
			t: "twilio";
			logger: ILogger;
	  }
	| {
			t: "fake";
			logger: ILogger;
	  };

export const SMS = (impl: SMSImpl): ISMS => {
	switch (impl.t) {
		case "fake": {
			return SMSFake(impl);
		}
		case "twilio": {
			return SMSTwilio(impl);
		}
	}
};
