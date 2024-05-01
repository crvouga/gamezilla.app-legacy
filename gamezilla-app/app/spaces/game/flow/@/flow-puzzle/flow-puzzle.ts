import { UserId } from "gamezilla-app/app/@/data";
import { Posix } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { FlowVariant } from "../flow";
import { FlowPuzzleId } from "./flow-puzzle-id";
import { FlowPuzzleName } from "./flow-puzzle-name";

const parser = p.obj({
	id: FlowPuzzleId,
	name: FlowPuzzleName,
	createdAt: Posix,
	createdBy: UserId,
	lastUpdatedAt: Posix,
	lastUpdatedBy: UserId,
	flow: FlowVariant.Model,
});

export type FlowPuzzle = p.Infer<typeof parser>;

const create = async (input: {
	count: number;
	flow: FlowVariant.Model;
	createdAt: Posix;
	createdBy: UserId;
}): Promise<FlowPuzzle> => {
	return {
		flow: input.flow,
		name: await FlowPuzzleName.generate({ count: input.count }),
		id: FlowPuzzleId.generate(),
		createdAt: input.createdAt,
		createdBy: input.createdBy,
		lastUpdatedAt: input.createdAt,
		lastUpdatedBy: input.createdBy,
	};
};

export const FlowPuzzle = {
	...parser,
	create,
};
