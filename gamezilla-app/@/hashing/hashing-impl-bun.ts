import {HashValue} from './hash-value';
import type {IHashing} from './hashing';

export const Hashing = (): IHashing => {
	// https://bun.sh/docs/api/hashing
	return {
		async hash({algo, password}) {
			switch (algo.t) {
				case 'bcrypt': {
					const hashedInput =
						await Bun.password.hash(
							password,
							{
								algorithm: algo.t,
								cost: algo.cost,
							},
						);

					const value =
						HashValue.fromString(
							hashedInput,
						);

					return {
						algo,
						value,
					};
				}
				case 'argon2d':
				case 'argon2i':
				case 'argon2id': {
					const hashedInput =
						await Bun.password.hash(
							password,
							{
								algorithm: algo.t,
								memoryCost: algo.memoryCost,
								timeCost: algo.timeCost,
							},
						);
					const value =
						HashValue.fromString(
							hashedInput,
						);

					return {
						algo,
						value,
					};
				}

				case 'sha256': {
					const hasher =
						new Bun.CryptoHasher(
							'sha256',
						);

					hasher.update(
						password,
					);

					const hashedInput =
						hasher
							.digest()
							.toString();

					const value =
						HashValue.fromString(
							hashedInput,
						);

					return {
						algo,
						value,
					};
				}
			}
		},

		async check({hash, password}) {
			switch (hash.algo.t) {
				case 'argon2d':
				case 'argon2i':
				case 'argon2id':
				case 'bcrypt': {
					return Bun.password.verify(
						password,
						hash.value.toString(),
					);
				}
				case 'sha256': {
					const hasher =
						new Bun.CryptoHasher(
							'sha256',
						);

					hasher.update(
						password,
					);

					const hashedInput =
						hasher
							.digest()
							.toString();

					return (
						hashedInput ===
						hash.value.toString()
					);
				}
			}
		},
	};
};
