import {ascend} from 'gamezilla-app/@/core';
import {MinHeap} from 'gamezilla-app/@/min-heap/min-heap';
import {FlowVariant} from '../..';
import {Flow} from '../../../flow';
import {FlowGroupId} from '../../flow/flow-group-id';
import {FlowNodeId} from '../../flow/flow-node-id';
import {FlowTerminal} from '../../flow/flow-terminal';
import {FlowAlgoIsUnsolvable} from '../flow-algo-is-unsolvable';

const toDirection = (
	model: FlowVariant.Model,
	sourceId: FlowNodeId,
	targetId: FlowNodeId,
): string => {
	const distance = FlowVariant.distance(
		model,
		sourceId,
		targetId,
	);
	return `${sourceId}${targetId}${distance}`;
};

const countTurns = (model: FlowVariant.Model, path: Flow.Edge[]): number => {
	let turns = 0;
	let prevDirection = '';
	for (let i = 0; i < path.length; i++) {
		const curr = path[i];
		if (!curr) continue;
		const currDirection = toDirection(
			model,
			curr.sourceId,
			curr.targetId,
		);
		if (
			prevDirection &&
			prevDirection !== currDirection
		) {
			turns++;
		}
		prevDirection = currDirection;
	}
	return turns;
};

const toHeuristic = (
	model: FlowVariant.Model,
	currentNode: FlowNodeId,
	endNode: FlowNodeId,
	path: Flow.Edge[],
): number => {
	const distanceHeuristic = FlowVariant.distance(
		model,
		currentNode,
		endNode,
	);
	const turnsHeuristic = countTurns(model, path);
	return distanceHeuristic + turnsHeuristic * 1.5;
};

const normalizePath = (path: Flow.Edge[]): string => {
	return path
		.map(
			(edge) =>
				`${edge.sourceId}-${edge.targetId}`,
		)
		.join(',');
};

// const MAX_ITERATIONS = 5000;

const toPossiblePipelines = function* (
	model: FlowVariant.Model,
	groupId: FlowGroupId,
	startId: FlowNodeId,
	endId: FlowNodeId,
): Iterable<Flow.Edge[]> {
	type HeapItem = {
		path: Flow.Edge[];
		currentNode: FlowNodeId;
		visited: Set<FlowNodeId>;
		cost: number;
		heuristic: number;
	};

	const minHeap = new MinHeap<HeapItem>(
		(a, b) => a.heuristic - b.heuristic,
	);
	const visitedPaths = new Set<string>();

	minHeap.insert({
		path: [],
		currentNode: startId,
		visited: new Set([startId]),
		cost: 0,
		heuristic: FlowVariant.distance(
			model,
			startId,
			endId,
		),
	});

	while (!minHeap.isEmpty()) {
		const min = minHeap.extractMin();

		if (!min) {
			break;
		}

		const {path, currentNode, visited, cost} = min;

		if (currentNode === endId) {
			const normalizedPath =
				normalizePath(
					path,
				);
			if (
				!visitedPaths.has(
					normalizedPath,
				)
			) {
				visitedPaths.add(
					normalizedPath,
				);
				yield path;
			}
			continue;
		}

		for (const edgeOut of Flow.yieldEdgesOut(
			model,
			currentNode,
		)) {
			const targetGroupId =
				Flow.toGroupId(
					model,
					edgeOut.targetId,
				);

			if (
				targetGroupId &&
				targetGroupId !==
					groupId
			) {
				continue;
			}

			if (
				visited.has(
					edgeOut.targetId,
				)
			) {
				continue;
			}

			const newPath = [
				...path,
				edgeOut,
			];
			const newVisited = new Set(
				visited,
			).add(edgeOut.targetId);
			const newCost = cost + 1;
			const heuristic = toHeuristic(
				model,
				edgeOut.targetId,
				endId,
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
	terminal: FlowTerminal,
	path: Flow.Edge[],
): FlowVariant.Model => {
	const pipesBySourceId = {...model.pipesBySourceId};

	for (const edge of path) {
		pipesBySourceId[edge.sourceId] = {
			edgeId: Flow.toFlowEdgeId(edge),
			groupId: terminal.groupId,
		};
	}

	return {
		...model,
		pipesBySourceId,
	};
};

const solveStep = function* (
	model: FlowVariant.Model,
	disconnectedTerminals: FlowTerminal[],
): Iterable<Flow.Model> {
	if (FlowAlgoIsUnsolvable.isUnsolvable(model)) {
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

	const possiblePipelines = toPossiblePipelines(
		model,
		terminal.groupId,
		terminal.startId,
		terminal.endId,
	);

	const disconnectedTerminalsRest =
		disconnectedTerminals.slice(1);

	for (const possiblePipeline of possiblePipelines) {
		const drew = drawPipeline(
			model,
			terminal,
			possiblePipeline,
		);
		yield* solveStep(
			drew,
			disconnectedTerminalsRest,
		);
	}
};

const toTerminalDistance = (
	model: FlowVariant.Model,
	terminal: FlowTerminal,
): number => {
	if (!terminal.endId) {
		return Number.POSITIVE_INFINITY;
	}
	return FlowVariant.distance(
		model,
		terminal.startId,
		terminal.endId,
	);
};

export const solutions = function* (
	model: FlowVariant.Model,
): Iterable<Flow.Model> {
	const cleared = Flow.removeAllPipelines(model);
	const disconnectedTerminals = Flow.toTerminals(cleared);

	disconnectedTerminals.sort(
		ascend((terminal) =>
			toTerminalDistance(
				cleared,
				terminal,
			),
		),
	);

	yield* solveStep(cleared, disconnectedTerminals);
};

export const solve = (model: FlowVariant.Model): Flow.Model | null => {
	for (const solution of solutions(model)) {
		return solution;
	}
	return null;
};
