import { Err, Ok, type Result } from "gamezilla-app/@shared/core";
import type { Brand } from "gamezilla-app/@shared/core/brand";
import { getWords } from "../words";

export type Username = Brand<string, "Username">;

const is = (username: unknown): username is Username => {
	return (
		typeof username === "string" &&
		username.length > 0 &&
		username.length <= 100
	);
};

type Problem = "invalid_username";

const decode = (username: unknown): Result<Problem, Username> => {
	if (is(username)) {
		return Ok(username);
	}
	return Err("invalid_username");
};

const fromString = (username: string): Username => {
	const cleaned = username.substring(0, 100);
	if (is(cleaned)) {
		return cleaned;
	}

	throw new Error("impossible state. did not create username from string");
};

const generate = async (
	separator?: string,
	digitCount?: number,
	length?: number,
): Promise<Username> => {
	const { adjectives, nouns } = await getWords();

	const noun = nouns[Math.floor(Math.random() * nouns.length)] ?? "";
	const adjective =
		adjectives[Math.floor(Math.random() * adjectives.length)] ?? "";

	let username;
	if (separator) {
		username = adjective + separator + noun + getRandomDigits(digitCount);
	} else {
		username = adjective + noun + getRandomDigits(digitCount);
	}

	if (length) {
		return fromString(username.substring(0, length));
	}

	return fromString(username);
};

const getRandomDigits = (digitCount?: number) => {
	if (!digitCount) {
		return "";
	}
	const min = Math.pow(10, digitCount - 1);
	const max = Math.pow(10, digitCount) - 1;
	return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export const Username = {
	is,
	fromString,
	decode,
	generate,
};
