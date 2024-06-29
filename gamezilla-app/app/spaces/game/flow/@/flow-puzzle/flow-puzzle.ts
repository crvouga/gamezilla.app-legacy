import { Posix } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { UserId } from "gamezilla-app/app/@/data";
import { Flow, FlowAlgoSolve, FlowVariant } from "../flow";
import { FlowGridShorthand } from "../flow/flow-variant/flow-grid/flow-grid-shorthand";
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
	flowSolutions: p.arr(Flow.Model),
});

export type FlowPuzzle = p.Infer<typeof parser>;

const create = async (input: {
	count: number;
	flow: FlowVariant.Model;
	createdAt: Posix;
	createdBy: UserId;
}): Promise<FlowPuzzle> => {
	const solutions = FlowAlgoSolve.solve(input.flow, {
		distance: FlowVariant.distance(input.flow),
	});
	const solution = first(solutions);
	return {
		flow: input.flow,
		name: await FlowPuzzleName.generate({ count: input.count }),
		id: FlowPuzzleId.generate(),
		createdAt: input.createdAt,
		createdBy: input.createdBy,
		lastUpdatedAt: input.createdAt,
		lastUpdatedBy: input.createdBy,
		flowSolutions: solution ? [solution] : [],
	};
};

const first = <T>(iter: Iterable<T>): T | null => {
	for (const value of iter) {
		return value;
	}
	return null;
};

const random = async (input?: {
	flow?: FlowVariant.Model;
	createdBy?: UserId;
	createdAt?: Posix;
}): Promise<FlowPuzzle> => {
	const createdBy = input?.createdBy ?? UserId.generate();
	const createdAt = input?.createdAt ?? Posix.now();
	const flow =
		input?.flow ??
		FlowGridShorthand.toGrid([
			["A", " "],
			[" ", "A"],
		]);
	const solutions = FlowAlgoSolve.solve(flow, {
		distance: FlowVariant.distance(flow),
	});
	const solution = first(solutions);
	return {
		createdAt,
		createdBy,
		name: await FlowPuzzleName.generate({
			count: 0,
		}),
		lastUpdatedAt: Posix.now(),
		lastUpdatedBy: createdBy,
		id: FlowPuzzleId.generate(),
		flowSolutions: solution ? [solution] : [],
		flow,
	};
};

export const FlowPuzzle = {
	...parser,
	create,
	random,
};
