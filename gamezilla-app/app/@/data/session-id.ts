import type { Brand } from "gamezilla-app/@/core/brand";
import { p } from "gamezilla-app/@/core/parser";
import { Result } from "gamezilla-app/@/core/result";

export type SessionId = Brand<string, "SessionId">;

const namespace = "session";
const separator = ":";

const is = (id: unknown): id is SessionId => {
	return typeof id === "string" && id.startsWith(`${namespace}${separator}`);
};

const parser = p.custom(is, "Invalid session id");

type Problem = "invalid_session_id";

export const decode = (id: string): Result<Problem, SessionId> => {
	if (is(id)) {
		return Result.Ok(id);
	}

	return Result.Err("invalid_session_id");
};

const characters =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

const randomCharacter = (word: string): string => {
	return word[Math.floor(Math.random() * word.length)] ?? "a";
};

const generateId = (length: number): string => {
	let runningId = "";

	for (let i = 0; i < length; i++) {
		runningId = `${runningId}${randomCharacter(characters)}`;
	}

	return runningId;
};

export const generate = (): SessionId => {
	const id = generateId(8);
	const sessionId = `${namespace}${separator}${id}`;

	if (is(sessionId)) {
		return sessionId;
	}

	throw new Error("generated invalid session id");
};

export const SessionId = {
	...parser,
	generate,
	decode,
	is,
};
