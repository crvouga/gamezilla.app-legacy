import * as ImplTwilio from "./verify-sms-provider-impl-twilio";
import * as ImplInHouse from "./verify-sms-provider-impl-in-house";
import { IVerifySMSProvider } from "./verify-sms-provider";

export type Impl =
	| ({ t: "twilio" } & ImplTwilio.Deps)
	| ({ t: "in-house" } & ImplInHouse.Deps);

export const VerifySMSProvider = (impl: Impl): IVerifySMSProvider => {
	switch (impl.t) {
		case "in-house": {
			return ImplInHouse.VerifySMSProvider(impl);
		}
		case "twilio": {
			return ImplTwilio.VerifySMSProvider();
		}
	}
};
