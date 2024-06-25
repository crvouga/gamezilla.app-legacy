import { Ok, type PhoneNumber } from "gamezilla-app/@/core";
import type { IVerifySMS } from "../verify-sms";
import * as ImplFake from "./verify-sms-impl-fake";
import * as ImplInHouse from "./verify-sms-impl-in-house";
import * as ImplTwilio from "./verify-sms-impl-twilio";

export type Impl =
	| ({ t: "in-house" } & ImplInHouse.Deps)
	| ({ t: "fake" } & ImplFake.Deps)
	| ({ t: "twilio" } & ImplTwilio.Deps)
	| { t: "fake-always-ok"; phoneNumber?: PhoneNumber };

export const VerifySMS = (impl: Impl): IVerifySMS => {
	switch (impl.t) {
		case "fake": {
			return ImplFake.VerifySMS(impl);
		}

		case "fake-always-ok": {
			return {
				async sendCode() {
					return Ok(null);
				},
				async verifyCode() {
					return Ok(null);
				},
			};
		}

		case "in-house": {
			return ImplInHouse.VerifySMS(impl);
		}

		case "twilio": {
			return ImplTwilio.VerifySMS(impl);
		}
	}
};
