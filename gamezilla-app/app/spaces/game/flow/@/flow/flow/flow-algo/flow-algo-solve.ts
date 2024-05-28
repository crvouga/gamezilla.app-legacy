import { MinHeap } from "gamezilla-app/@/min-heap/min-heap";
import * as Flow from "../flow";

const calculateDirection = (
	sourceId: Flow.NodeId,
	targetId: Flow.NodeId,
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
): string => {
	const dist = distance(sourceId, targetId);
	return `${sourceId}${targetId}${dist}`;
};

const countTurns = (
	path: Flow.Edge[],
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
): number => {
	let turns = 0;
	for (let i = 1; i < path.length; i++) {
		const prevDirection = calculateDirection(
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			path[i - 1]!.sourceId,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			path[i - 1]!.targetId,
			distance,
		);
		const currDirection = calculateDirection(
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			path[i]!.sourceId,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			path[i]!.targetId,
			distance,
		);
		if (prevDirection !== currDirection) {
			turns++;
		}
	}
	return turns;
};

const calculateHeuristic = (
	_model: Flow.Model,
	currentNode: Flow.NodeId,
	endNode: Flow.NodeId,
	path: Flow.Edge[],
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
): number => {
	const distanceHeuristic = distance(currentNode, endNode);
	const turnsHeuristic = countTurns(path, distance);
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
	model: Flow.Model;
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId;
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number;
}): Iterable<Flow.Edge[]> {
	type QueueItem = {
		path: Flow.Edge[];
		currentNode: Flow.NodeId;
		visited: Set<Flow.NodeId>;
		cost: number;
		heuristic: number;
	};

	const queue = new MinHeap<QueueItem>((a, b) => a.heuristic - b.heuristic);
	const visitedPaths = new Set<string>();

	queue.insert({
		path: [],
		currentNode: input.startId,
		visited: new Set([input.startId]),
		cost: 0,
		heuristic: input.distance(input.startId, input.endId),
	});

	while (!queue.isEmpty()) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		const { path, currentNode, visited, cost } = queue.extractMin()!;

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
				input.distance,
			);

			queue.insert({
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
	model: Flow.Model,
	terminal: Flow.Terminal,
	path: Flow.Edge[],
): Flow.Model => {
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

export const solve = function* (
	model: Flow.Model,
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
): Iterable<Flow.Model> {
	if (Flow.isSolved(model)) {
		yield model;
		return;
	}

	const terminals = Flow.toTerminals(model);

	terminals.sort((a, b) => {
		if (a.endId && b.endId) {
			return distance(a.startId, a.endId) - distance(b.startId, b.endId);
		}
		return 0;
	});

	for (const terminal of terminals) {
		if (!terminal.endId) {
			continue;
		}

		if (Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
			continue;
		}

		const possiblePipelines = toPossiblePipelines({
			model,
			endId: terminal.endId,
			groupId: terminal.groupId,
			startId: terminal.startId,
			distance,
		});

		for (const possiblePipeline of possiblePipelines) {
			const drew = drawPipeline(model, terminal, possiblePipeline);
			for (const solution of solve(drew, distance)) {
				yield solution;
			}
		}

		break;
	}
};
