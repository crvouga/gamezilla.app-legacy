import { Err, Ok, type Result, Uuid } from "gamezilla-app/@/core";
import type { Brand } from "gamezilla-app/@/core/brand";
import { p } from "gamezilla-app/@/core/parser";

export type EventId = Brand<string, "EventId">;

const namespace = "space-event";
const separator = ":";

const is = (id: unknown): id is EventId => {
	return typeof id === "string";
};

const parser = p.custom(is, "Invalid event id");

type Problem = "invalid_id";

const decode = (id: string): Result<Problem, EventId> => {
	if (is(id)) {
		return Ok(id);
	}

	return Err("invalid_id");
};

const baseId = Uuid.generate();
let runningId = 0;

const generate = (): EventId => {
	runningId++;
	const id = `${baseId}-${runningId}`;

	const msgEvtId = `${namespace}${separator}${id}`;

	if (is(msgEvtId)) {
		return msgEvtId;
	}

	throw new Error("impossible condition. generated invalid id");
};

export const EventId = {
	...parser,
	is,
	decode,
	generate,
};
