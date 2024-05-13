import { HashValue } from "./hash-value";
import type { IHashing } from "./hashing";
import { sha256 } from "js-sha256";

export const Hashing = (): IHashing => {
	// https://bun.sh/docs/api/hashing
	return {
		async hash({ algo, password }) {
			switch (algo.t) {
				case "bcrypt": {
					throw new Error("bcrypt is not supported in this environment");
				}
				case "argon2d":
				case "argon2i":
				case "argon2id": {
					throw new Error("argon2 is not supported in this environment");
				}

				case "sha256": {
					const hashed = sha256(password);

					const value = HashValue.fromString(hashed);

					return { algo, value };
				}
			}
		},

		async check({ hash, password }) {
			switch (hash.algo.t) {
				case "argon2d":
				case "argon2i":
				case "argon2id":
				case "bcrypt": {
					throw new Error(
						"argon2 and bcrypt are not supported in this environment",
					);
				}
				case "sha256": {
					const hashed = sha256(password);

					return hashed === hash.value.toString();
				}
			}
		},
	};
};
