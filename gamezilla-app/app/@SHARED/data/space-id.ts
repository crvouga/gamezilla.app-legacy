import { Result } from "gamezilla-app/@shared/core";
import type { Brand } from "gamezilla-app/@shared/core/brand";
import { p } from "gamezilla-app/@shared/core/parser";

export type SpaceId = Brand<string, "SpaceId">;

const namespace = "space";
const separator = ":";

const is = (id: unknown): id is SpaceId => {
	// todo: better validation
	return typeof id === "string";
};
const parser = p.custom(is, "Invalid space id");

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, SpaceId> => {
	if (is(id)) {
		return Result.Ok(id);
	}

	return Result.Err("invalid_id");
};

const generate = (): SpaceId => {
	// warning collisions could happen
	// use short id so the logs are more readable
	const spaceId = `${namespace}${separator}${Math.random()
		.toString(36)
		.slice(-6)}`;

	if (is(spaceId)) {
		return spaceId;
	}

	throw new Error("generated invalid id");
};

export const SpaceId = {
	...parser,
	is,
	decode,
	generate,
};
