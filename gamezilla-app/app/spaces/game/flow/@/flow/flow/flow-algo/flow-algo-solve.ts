import { MinHeap } from "gamezilla-app/@/min-heap/min-heap";
import * as Flow from "../flow";

export type Config = {
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number;
};

const calculateDirection = (
	config: Config,
	sourceId: Flow.NodeId,
	targetId: Flow.NodeId,
): string => {
	const distance = config.distance(sourceId, targetId);
	return `${sourceId}${targetId}${distance}`;
};

const countTurns = (config: Config, path: Flow.Edge[]): number => {
	let turns = 0;
	for (let i = 1; i < path.length; i++) {
		const prevDirection = calculateDirection(
			config,
			path[i - 1]!.sourceId,
			path[i - 1]!.targetId,
		);
		const currDirection = calculateDirection(
			config,
			path[i]!.sourceId,
			path[i]!.targetId,
		);
		if (prevDirection !== currDirection) {
			turns++;
		}
	}
	return turns;
};

const calculateHeuristic = (
	config: Config,
	currentNode: Flow.NodeId,
	endNode: Flow.NodeId,
	path: Flow.Edge[],
): number => {
	const distanceHeuristic = config.distance(currentNode, endNode);
	const turnsHeuristic = countTurns(config, path);
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
	config: Config;
	model: Flow.Model;
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
		heuristic: input.config.distance(input.startId, input.endId),
	});

	while (!minHeap.isEmpty()) {
		const { path, currentNode, visited, cost } = minHeap.extractMin()!;

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
				input.config,
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

const solveStep = function* (
	config: Config,
	model: Flow.Model,
	terminals: Flow.Terminal[],
): Iterable<Flow.Model> {
	if (Flow.isSolved(model)) {
		yield model;
		return;
	}

	const terminal = terminals[0];

	if (!terminal || !terminal.endId) {
		return;
	}

	const possiblePipelines = toPossiblePipelines({
		config,
		model,
		endId: terminal.endId,
		groupId: terminal.groupId,
		startId: terminal.startId,
	});

	for (const possiblePipeline of possiblePipelines) {
		const drew = drawPipeline(model, terminal, possiblePipeline);
		yield* solveStep(config, drew, terminals.slice(1));
	}
};

export const solve = function* (
	config: Config,
	model: Flow.Model,
): Iterable<Flow.Model> {
	const terminals = Flow.toTerminals(model);

	terminals.sort((a, b) => {
		if (a.endId && b.endId) {
			return (
				config.distance(a.startId, a.endId) -
				config.distance(b.startId, b.endId)
			);
		}
		return 0;
	});

	yield* solveStep(config, model, terminals);
};
