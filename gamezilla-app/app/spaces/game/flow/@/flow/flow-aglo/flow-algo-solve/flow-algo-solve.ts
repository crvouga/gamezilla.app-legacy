import { MinHeap } from "gamezilla-app/@/min-heap/min-heap";
import { Flow } from "../../../flow";
import { FlowVariant } from "../..";

const calculateDirection = (
	model: FlowVariant.Model,
	sourceId: Flow.NodeId,
	targetId: Flow.NodeId,
): string => {
	const distance = FlowVariant.distance(model, sourceId, targetId);
	return `${sourceId}${targetId}${distance}`;
};

const countTurns = (model: FlowVariant.Model, path: Flow.Edge[]): number => {
	let turns = 0;
	for (let i = 1; i < path.length; i++) {
		const prev = path[i - 1];
		if (!prev) {
			continue;
		}
		const prevDirection = calculateDirection(
			model,
			prev.sourceId,
			prev.targetId,
		);
		const curr = path[i];
		if (!curr) {
			continue;
		}
		const currDirection = calculateDirection(
			model,
			curr.sourceId,
			curr.targetId,
		);
		if (prevDirection !== currDirection) {
			turns++;
		}
	}
	return turns;
};

const calculateHeuristic = (
	model: FlowVariant.Model,
	currentNode: Flow.NodeId,
	endNode: Flow.NodeId,
	path: Flow.Edge[],
): number => {
	const distanceHeuristic = FlowVariant.distance(model, currentNode, endNode);
	const turnsHeuristic = countTurns(model, path);
	const heuristic = distanceHeuristic + turnsHeuristic * 1.5;
	return heuristic;
};

const normalizePath = (path: Flow.Edge[]): string => {
	return path
		.map((edge) => `${edge.sourceId}-${edge.targetId}`)
		.sort()
		.join(",");
};

const toPossiblePipelines = function* (input: {
	model: FlowVariant.Model;
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId;
}): Iterable<Flow.Edge[]> {
	type HeapItem = {
		path: Flow.Edge[];
		currentNode: Flow.NodeId;
		visited: Set<Flow.NodeId>;
		cost: number;
		heuristic: number;
	};

	const minHeap = new MinHeap<HeapItem>((a, b) => a.heuristic - b.heuristic);
	const visitedPaths = new Set<string>();

	minHeap.insert({
		path: [],
		currentNode: input.startId,
		visited: new Set([input.startId]),
		cost: 0,
		heuristic: FlowVariant.distance(input.model, input.startId, input.endId),
	});

	while (!minHeap.isEmpty()) {
		const min = minHeap.extractMin();

		if (!min) {
			break;
		}

		const { path, currentNode, visited, cost } = min;

		if (currentNode === input.endId) {
			const normalizedPath = normalizePath(path);
			if (!visitedPaths.has(normalizedPath)) {
				visitedPaths.add(normalizedPath);
				yield path;
			}
			continue;
		}

		for (const edgeOut of Flow.yieldEdgesOut(input.model, currentNode)) {
			const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId);

			if (targetGroupId && targetGroupId !== input.groupId) {
				continue;
			}

			if (visited.has(edgeOut.targetId)) {
				continue;
			}

			const newPath = [...path, edgeOut];
			const newVisited = new Set(visited).add(edgeOut.targetId);
			const newCost = cost + 1;
			const heuristic = calculateHeuristic(
				input.model,
				edgeOut.targetId,
				input.endId,
				newPath,
			);

			minHeap.insert({
				path: newPath,
				currentNode: edgeOut.targetId,
				visited: newVisited,
				cost: newCost,
				heuristic,
			});
		}
	}
};

const drawPipeline = (
	model: FlowVariant.Model,
	terminal: Flow.Terminal,
	path: Flow.Edge[],
): FlowVariant.Model => {
	const pipesBySourceId = { ...model.pipesBySourceId };

	for (const edge of path) {
		pipesBySourceId[edge.sourceId] = {
			edgeId: Flow.toEdgeId(edge),
			groupId: terminal.groupId,
		};
	}

	return {
		...model,
		pipesBySourceId,
	};
};

const isSolvable = (
	model: FlowVariant.Model,
	disconnectedTerminals: Flow.Terminal[],
): boolean => {
	const totalCells = Object.keys(model.nodes).length;
	const filledCells = Object.keys(model.pipesBySourceId).length;
	const openCells = totalCells - filledCells;

	// Calculate the required cells for connecting all terminals
	const requiredCells = disconnectedTerminals.reduce((sum, terminal) => {
		if (terminal.endId) {
			const dist = FlowVariant.distance(
				model,
				terminal.startId,
				terminal.endId,
			);
			return sum + dist;
		}
		return sum;
	}, 0);

	return openCells >= requiredCells;
};

// const isBoundaryNode = (config: Config, model: Flow.Model, nodeId: Flow.NodeId): boolean => {
// 	Flow.yieldEdgesOut(model, nodeId)
// 	Flow.yieldEdgesIn(model, nodeId)
// 	config.distance(nodeId, nodeId)
// 	return false;
// }

// const isUnsolvable = (config: Config, model: Flow.Model, disconnectedTerminals: Flow.Terminal[]): boolean => {
// 	for (const terminal of Flow.yieldTerminals(model)) {
// 		if(!terminal.endId) {
// 			continue;
// 		}
// 	}
// }

const solveStep = function* (
	model: FlowVariant.Model,
	disconnectedTerminals: Flow.Terminal[],
	depth: number = 0,
	maxDepth: number = 100,
): Iterable<Flow.Model> {
	if (depth > maxDepth) {
		return;
	}

	if (!isSolvable(model, disconnectedTerminals)) {
		return;
	}

	if (Flow.isSolved(model)) {
		yield model;
		return;
	}

	const terminal = disconnectedTerminals[0];

	if (!terminal || !terminal.endId) {
		return;
	}

	const possiblePipelines = toPossiblePipelines({
		model,
		endId: terminal.endId,
		groupId: terminal.groupId,
		startId: terminal.startId,
	});

	for (const possiblePipeline of possiblePipelines) {
		const drew = drawPipeline(model, terminal, possiblePipeline);
		yield* solveStep(drew, disconnectedTerminals.slice(1), depth + 1, maxDepth);
	}
};

export const solutions = function* (
	model: FlowVariant.Model,
): Iterable<Flow.Model> {
	const terminals = Flow.toTerminals(model);

	terminals.sort((a, b) => {
		if (a.endId && b.endId) {
			return (
				FlowVariant.distance(model, a.startId, a.endId) -
				FlowVariant.distance(model, b.startId, b.endId)
			);
		}
		return Infinity;
	});

	yield* solveStep(model, terminals);
};

export const solve = (model: FlowVariant.Model): Flow.Model | null => {
	for (const solution of solutions(model)) {
		return solution;
	}
	return null;
};
