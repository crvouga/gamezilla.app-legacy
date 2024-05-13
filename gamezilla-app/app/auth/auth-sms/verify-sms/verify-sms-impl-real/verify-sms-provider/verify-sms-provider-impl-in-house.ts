import { Err, Ok, Posix, isErr } from "gamezilla-app/@/core";
import { IHashing } from "gamezilla-app/@/hashing";
import { LanguageCodeISO_639_1 } from "gamezilla-app/@/l18n";
import { Translator } from "gamezilla-app/@/l18n/generated";
import { ILogger } from "gamezilla-app/app/@/server/logger";
import { ISMS } from "gamezilla-app/app/@/server/sms";
import { IVerificationCodeGenerator } from "../../verification-code-generator";
import { IVerificationDb } from "../../verification/verification-db";
import { IVerifySMSProvider } from "./verify-sms-provider";
import { Verification } from "../../verification";

export type Deps = {
	logger: ILogger;
	sms: ISMS;
	verificationCodeGenerator: IVerificationCodeGenerator;
	verificationDb: IVerificationDb;
	Translator: (lang: LanguageCodeISO_639_1) => Translator;
	hashing: IHashing;
	now: () => Posix;
};

export const VerifySMSProvider = (deps: Deps): IVerifySMSProvider => {
	return {
		async sendCode(input) {
			const found = await deps.verificationDb.find({
				where: {
					phoneNumber: {
						"=": input.phoneNumber,
					},
				},
				order: {
					createdAt: "desc",
				},
			});

			if (isErr(found)) {
				return Err({
					t: "database-error",
					error: found.error,
				});
			}

			const verification = found.value.items[0] ?? null;

			if (!verification) {
				return Err({
					t: "database-error",
					error: "Bad logic. Verification not put in database before sending code.",
				});
			}

			const code = deps.verificationCodeGenerator.generate();

			const verificationNew: Verification = {
				...verification,
				codeHash: await deps.hashing.hash({
					algo: {
						t: "sha256",
					},
					password: code,
				}),
			};

			const put = await deps.verificationDb.put(verificationNew);

			if (isErr(put)) {
				return Err({
					t: "database-error",
					error: put.error,
				});
			}

			const sent = await deps.sms.sendMessage({
				message: deps.Translator(input.perferredLanguage)(
					"verify-sms.code-message",
					code,
				),
				phoneNumber: input.phoneNumber,
			});

			if (isErr(sent)) {
				return Err({
					t: "database-error",
					error: sent.error,
				});
			}

			return Ok(null);
		},

		async verifyCode(input) {
			const found = await deps.verificationDb.find({
				where: {
					phoneNumber: {
						"=": input.phoneNumber,
					},
				},
				order: {
					createdAt: "desc",
				},
			});

			if (isErr(found)) {
				return Err({
					t: "database-error",
					error: found.error,
				});
			}

			const verification = found.value.items[0] ?? null;

			if (!verification) {
				return Err({
					t: "verification-not-found",
				});
			}

			if (!verification.codeHash) {
				return Err({
					t: "verification-not-found",
				});
			}

			const isCorrect = await deps.hashing.check({
				hash: verification.codeHash,
				password: input.code,
			});

			if (!isCorrect) {
				return Err({
					t: "code-incorrect",
				});
			}

			return Ok({
				phoneNumber: verification.phoneNumber,
			});
		},
	};
};
