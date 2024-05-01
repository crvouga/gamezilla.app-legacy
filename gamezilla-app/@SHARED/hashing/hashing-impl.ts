import type { IHashing } from "./hashing";
import * as ImplBun from "./hashing-impl-bun";
import * as ImplNoop from "./hashing-impl-noop";

export type HashingImpl =
	| {
			t: "bun";
	  }
	| {
			t: "noop";
	  };

export const Hashing = (impl: HashingImpl): IHashing => {
	switch (impl.t) {
		case "bun": {
			return ImplBun.Hashing();
		}

		case "noop": {
			return ImplNoop.Hashing();
		}
	}
};
