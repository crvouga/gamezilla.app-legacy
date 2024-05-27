import * as Flow from "../flow";
import * as FlowAlgoDrawPipes from "./flow-algo-draw-pipes";

export const toAllPaths = (
	model: Flow.Model,
	startId: Flow.NodeId,
	endId: Flow.NodeId,
	visited: Set<Flow.NodeId> = new Set(),
): Flow.Edge[][] => {
	if (startId === endId) {
		return [[]];
	}

	if (visited.has(startId)) {
		return [];
	}

	visited.add(startId);

	const allPaths: Flow.Edge[][] = [];

	for (const edgeOut of Flow.yieldEdgesOut(model, startId)) {
		const subPaths = toAllPaths(
			model,
			edgeOut.targetId,
			endId,
			new Set(visited),
		);

		for (const subPath of subPaths) {
			allPaths.push([edgeOut, ...subPath]);
		}
	}

	visited.delete(startId);

	return allPaths;
};

const drawPath = (
	model: Flow.Model,
	groupId: Flow.GroupId,
	path: Flow.Edge[],
): Flow.Model => {
	let modelNew = { ...model };
	for (const edge of path) {
		modelNew = FlowAlgoDrawPipes.drawPipes(
			() => Infinity,
			modelNew,
			groupId,
			edge.targetId,
		);
	}
	return modelNew;
};

export const toSolutions = (model: Flow.Model): Flow.Model[] => {
	if (Flow.isSolved(model)) {
		return [model];
	}

	const solutions: Flow.Model[] = [];

	for (const terminal of Flow.toTerminals(model)) {
		if (!terminal.endId) {
			continue;
		}

		if (Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
			continue;
		}

		const allPaths = toAllPaths(model, terminal.startId, terminal.endId);

		for (const path of allPaths) {
			const drewPath = drawPath(model, terminal.groupId, path);

			if (
				!Flow.isConnectedWithPipes(drewPath, terminal.startId, terminal.endId)
			) {
				continue;
			}

			if (Flow.isSolved(drewPath)) {
				solutions.push(drewPath);
				continue;
			}

			const subSolutions = solve(drewPath);

			solutions.push(...subSolutions);
		}
	}

	return solutions;
};

export const solve = (model: Flow.Model): Flow.Model[] => {
	const solutions = toSolutions(model);

	const minimalSolutions = minAllBy(solutions, toTotalPipelineLength);

	const uniqueSolutions = uniqueWith(minimalSolutions, Flow.isSame);

	return uniqueSolutions;
};

const toTotalPipelineLength = (model: Flow.Model): number => {
	let total = 0;
	for (const terminal of Flow.yieldTerminals(model)) {
		for (const _ of Flow.yieldPipeline(model, terminal.startId)) {
			total += 1;
		}
	}
	return total;
};

const uniqueWith = <T>(arr: T[], fn: (left: T, right: T) => boolean): T[] => {
	const unique: T[] = [];
	for (const left of arr) {
		if (!unique.some((right) => fn(left, right))) {
			unique.push(left);
		}
	}
	return unique;
};

const minAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
	let min = Infinity;
	for (const item of arr) {
		const value = fn(item);
		if (value < min) {
			min = value;
		}
	}
	return arr.filter((item) => fn(item) === min);
};
