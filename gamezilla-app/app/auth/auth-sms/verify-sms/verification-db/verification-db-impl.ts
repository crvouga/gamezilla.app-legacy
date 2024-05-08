import type { IVerificationDb } from "./verification-db";
import { VerificationDbHashMap } from "./verification-db-impl-hash-map";

export type Impl = {
	t: "hash-map";
};

export const VerificationDb = (impl: Impl): IVerificationDb => {
	switch (impl.t) {
		case "hash-map": {
			return VerificationDbHashMap();
		}
	}
};
