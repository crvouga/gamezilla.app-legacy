import { Uuid } from "gamezilla-app/@shared/core";
import type { Brand } from "gamezilla-app/@shared/core/brand";

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
