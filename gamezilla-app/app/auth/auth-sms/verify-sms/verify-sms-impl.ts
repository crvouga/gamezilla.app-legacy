import type { IVerifySMS } from "./verify-sms";
import * as ImplReal from "./verify-sms-impl-real";
import * as ImplFake from "./verify-sms-impl-test";

export type Impl =
	| ({ t: "real" } & ImplReal.VerifySMSDeps)
	| ({ t: "fake" } & ImplFake.VerifySMSDeps);

export const VerifySMS = (impl: Impl): IVerifySMS => {
	switch (impl.t) {
		case "fake": {
			return ImplFake.VerifySMS(impl);
		}

		case "real": {
			return ImplReal.VerifySMS(impl);
		}
	}
};
