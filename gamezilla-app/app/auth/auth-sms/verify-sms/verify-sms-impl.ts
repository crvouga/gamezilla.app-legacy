import { Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { IVerifySMS } from "./verify-sms";
import * as ImplReal from "./verify-sms-impl-real";
import * as ImplFake from "./verify-sms-impl-fake";
import { VerificationId } from "./verification";

export type Impl =
	| ({ t: "real" } & ImplReal.VerifySMSDeps)
	| ({ t: "fake" } & ImplFake.VerifySMSDeps)
	| { t: "fake-always-ok"; phoneNumber?: PhoneNumber };

export const VerifySMS = (impl: Impl): IVerifySMS => {
	switch (impl.t) {
		case "fake": {
			return ImplFake.VerifySMS(impl);
		}
			
		case "fake-always-ok": {
			return {
				async sendCode() {
					return Ok({ verificationId: VerificationId.generate() });
				},
				async verifyCode() {
					return Ok({ phoneNumber: impl.phoneNumber ?? PhoneNumber.random() });
				},
			};
		}

		case "real": {
			return ImplReal.VerifySMS(impl);
		}
	}
};
