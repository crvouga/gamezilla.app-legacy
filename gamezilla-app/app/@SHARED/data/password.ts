import { Result } from "gamezilla-app/@shared/core";
import type { Brand } from "gamezilla-app/@shared/core/brand";

export type Password = Brand<string, "Password">;

const passwordMinLength = 6;

const is = (password: unknown): password is Password => {
	return typeof password === "string" && password.length >= passwordMinLength;
};

type Problem = { message: string };

const decode = (password: string): Result<Problem, Password> => {
	if (password.length < passwordMinLength) {
		return Result.Err({
			message: `Password must be longer than ${passwordMinLength} characters.`,
		});
	}

	if (is(password)) {
		return Result.Ok(password);
	}

	return Result.Err({ message: "Password is invalid for an unknown reason." });
};

export const Password = {
	is,
	decode,
};
