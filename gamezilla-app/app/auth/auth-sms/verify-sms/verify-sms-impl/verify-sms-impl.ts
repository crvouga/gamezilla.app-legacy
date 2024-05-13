import { Ok, PhoneNumber } from "gamezilla-app/@/core";
import type { IVerifySMS } from "../verify-sms";
import * as ImplFake from "./verify-sms-impl-fake";
import * as ImplReal from "./verify-sms-impl-real";

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
					return Ok(null);
				},
				async verifyCode() {
					return Ok(null);
				},
			};
		}

		case "real": {
			return ImplReal.VerifySMS(impl);
		}
	}
};
