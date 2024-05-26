import { Posix } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import { FlowVariant, FlowVariantDimensions } from "../flow";
import { FlowGrid } from "../flow/flow-variant/flow-grid";
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

const random = async (input?: {
	createdBy?: UserId;
	createdAt?: Posix;
}): Promise<FlowPuzzle> => {
	const createdBy = input?.createdBy ?? UserId.generate();
	const createdAt = input?.createdAt ?? Posix.now();
	return {
		createdAt,
		createdBy,
		name: await FlowPuzzleName.generate({
			count: 0,
		}),
		lastUpdatedAt: Posix.now(),
		lastUpdatedBy: createdBy,
		id: FlowPuzzleId.generate(),
		flow: FlowVariant.init({
			dimensions: FlowVariantDimensions.init({
				t: "flow-grid",
				height: 2,
				width: 2,
			}),
			terminalsByGroupId: {
				A: {
					startId: FlowGrid.toNodeId({ x: 0, y: 0 }),
					groupId: "A",
					endId: FlowGrid.toNodeId({ x: 1, y: 1 }),
				},
			},
		}),
	};
};

export const FlowPuzzle = {
	...parser,
	create,
	random,
};
