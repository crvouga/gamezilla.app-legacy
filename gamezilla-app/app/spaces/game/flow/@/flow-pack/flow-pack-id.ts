import { Uuid } from "gamezilla-app/@/core";
import type { Brand } from "gamezilla-app/@/core/brand";

export type FlowPackId = Brand<string, "FlowPackId">;

const generate = () => {
	return `flow-pack:${Uuid.generate()}` as FlowPackId;
};

const is = (flowPackId: unknown): flowPackId is FlowPackId => {
	return typeof flowPackId === "string";
};

export const FlowPackId = {
	is,
	generate,
};
