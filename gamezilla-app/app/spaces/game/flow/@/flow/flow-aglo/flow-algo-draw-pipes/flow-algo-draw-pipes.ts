import {pipe} from 'gamezilla-app/@/core';
import {MinHeap} from 'gamezilla-app/@/min-heap/min-heap';
import {Flow} from '../../../flow';
import {FlowVariant} from '../..';
import {FlowGroupId} from '../../flow/flow-group-id';
import {FlowNodeId} from '../../flow/flow-node-id';
import {FlowEdgeId} from '../../flow/flow-edge-id';
import {FlowTerminal} from '../../flow/flow-terminal';

/**
 * A `Pipeline` represents the sequence of nodes the user draws when connecting terminals.
 */
type Pipeline = FlowNodeId[];

/**
 * Starts
 */
export const startDrawPipes = (
	model: FlowVariant.Model,
	groupId: FlowGroupId,
	newNodeId: FlowNodeId,
): Flow.Model => {
	const terminal = Flow.toTerminalByGroupId(model, groupId);

	if (!terminal) {
		return model;
	}

	if (terminal.endId === newNodeId) {
		const reversed = Flow.flipTerminal(
			model,
			terminal,
		);

		const drew = drawPipes(
			reversed,
			groupId,
			newNodeId,
		);

		return drew;
	}

	const drew = drawPipes(model, groupId, newNodeId);

	return drew;
};

/**
 * Algorithm that draws pipes from the inputted group id to the inputted node id
 */
export const drawPipes = (
	model: FlowVariant.Model,
	groupId: FlowGroupId,
	nodeIdNew: FlowNodeId,
): Flow.Model => {
	const newNodeGroupId = Flow.findGroupIdByFlowNodeId(
		model,
		nodeIdNew,
	);

	if (newNodeGroupId && newNodeGroupId !== groupId) {
		return model;
	}

	const terminal = Flow.toTerminalByGroupId(model, groupId);

	if (!terminal) {
		return model;
	}

	if (!newNodeGroupId && isTerminalConnected(model, terminal)) {
		return model;
	}

	const existingPipeline = findPipeline(
		model,
		terminal.groupId,
		terminal.startId,
	);

	const pipelineNew = pipe(
		existingPipeline,

		(pipeline) =>
			takeWhile(
				pipeline,
				(nodeId) =>
					nodeId !==
						nodeIdNew &&
					nodeId !==
						terminal.endId,
			),

		(pipeline) => [...pipeline, nodeIdNew],

		(pipeline) =>
			takeWhileConnected(
				model,
				pipeline,
			),

		(pipeline) => {
			const startNodeId =
				pipeline[
					pipeline.length -
						1
				];

			if (!startNodeId) {
				return pipeline;
			}

			const shortest =
				findShortestEmptyPipelineAStar(
					(
						nodeId,
					) =>
						1 -
						1 /
							FlowVariant.distance(
								model,
								nodeId,
								nodeIdNew,
							),
					model,
					startNodeId,
					nodeIdNew,
				);

			const pipelineNew = [
				...pipeline,
				...shortest.slice(
					1,
				),
			];

			return pipelineNew;
		},
	);

	const added = addPipeline(
		Flow.removePipeline(model, groupId),
		terminal,
		pipelineNew,
	);

	return added;
};

/**
 * Takes nodes in order from the inputted pipeline until a node are no longer connected to the previous node
 */
const takeWhileConnected = (
	model: Flow.Model,
	pipeline: Pipeline,
): Pipeline => {
	const pipelineNew: Pipeline = [];

	for (let i = 0; i < pipeline.length; i++) {
		const currNode = pipeline[i];

		if (!currNode) {
			continue;
		}

		const prevNode =
			pipelineNew[
				pipelineNew.length -
					1
			];

		if (!prevNode) {
			pipelineNew.push(currNode);
			continue;
		}

		if (Flow.hasEdge(model, prevNode, currNode)) {
			pipelineNew.push(currNode);
			continue;
		}

		break;
	}
	return pipelineNew;
};

/**
 *
 */
const isTerminalConnected = (
	model: Flow.Model,
	terminal: FlowTerminal,
): boolean => {
	let currentId = terminal.startId;

	while (true) {
		if (currentId === terminal.endId) {
			return true;
		}

		const pipe = Flow.toPipeBySourceId(
			model,
			currentId,
		);

		if (!pipe) {
			return false;
		}

		if (pipe.groupId !== terminal.groupId) {
			return false;
		}

		currentId = pipe.edge.targetId;
	}
};

/**
 * Returns a pipeline for inputted group id starting from inputted node id
 */
const findPipeline = (
	model: Flow.Model,
	groupId: FlowGroupId,
	initial: FlowNodeId,
): Pipeline => {
	const pipeline: Pipeline = [];
	let currentId = initial;

	while (true) {
		pipeline.push(currentId);

		const pipe = Flow.toPipeBySourceId(
			model,
			currentId,
		);

		if (!pipe) {
			break;
		}

		if (pipe.groupId !== groupId) {
			break;
		}

		currentId = pipe.edge.targetId;
	}

	return pipeline;
};

/**
 * Adds all pipes that are part of the pipeline with the inputted group id
 */
const addPipeline = (
	model: Flow.Model,
	terminal: FlowTerminal,
	pipeline: Pipeline,
): Flow.Model => {
	const modelNew: Flow.Model = {...model};

	for (let i = 0; i < pipeline.length - 1; i++) {
		const first = pipeline[i];

		if (!first) {
			break;
		}

		const second = pipeline[i + 1];

		if (!second) {
			break;
		}

		const edge: Flow.Edge = {
			sourceId: first,
			targetId: second,
		};

		if (!Flow.hasEdge(modelNew, first, second)) {
			continue;
		}

		const pipeNew: Flow.Pipe = {
			edgeId: Flow.toFlowEdgeId(edge),
			groupId: terminal.groupId,
		};

		modelNew.pipesBySourceId[edge.sourceId] =
			pipeNew;
	}

	return modelNew;
};

/**
 * Returns a list of nodes without a groupId that form the shortest path between the source and target nodes.
 */
export const _findShortestEmptyPipelineBFS = (
	model: Flow.Model,
	sourceId: FlowNodeId,
	targetId: FlowNodeId,
): FlowNodeId[] => {
	const sourceGroupId = Flow.findGroupIdByFlowNodeId(
		model,
		sourceId,
	);

	if (!sourceGroupId) {
		return [];
	}

	const terminal = Flow.toTerminalByGroupId(model, sourceGroupId);

	//
	//
	//  Construct the breadth first tree
	//
	//

	const queue: FlowNodeId[] = [];
	const visited = new Set<FlowNodeId>();
	const tree: {[id: FlowNodeId]: {parent?: FlowNodeId}} = {};

	visited.add(sourceId);
	queue.push(sourceId);

	while (true) {
		const currentId = queue.shift();

		if (!currentId) {
			break;
		}

		visited.add(currentId);

		if (currentId === targetId) {
			break;
		}

		if (currentId === terminal?.endId) {
			break;
		}

		for (const outEdge of Flow.yieldEdgesOut(
			model,
			currentId,
		)) {
			const adjacentId =
				outEdge.targetId;

			if (visited.has(adjacentId)) {
				continue;
			}

			const adjacentPipe =
				Flow.findPipeByFlowNodeId(
					model,
					adjacentId,
				);

			if (adjacentPipe) {
				continue;
			}

			const adjacentTerminal =
				Flow.findTerminalByFlowNodeId(
					model,
					adjacentId,
				);

			if (
				adjacentTerminal &&
				adjacentTerminal.groupId !==
					sourceGroupId
			) {
				continue;
			}

			queue.push(adjacentId);
			tree[adjacentId] = {
				parent: currentId,
			};
		}
	}

	// Construct the path from the breadth first tree

	let current = targetId;
	const nodePath: FlowNodeId[] = [current];

	while (current !== sourceId) {
		const parent = tree[current]?.parent;

		if (!parent) {
			break;
		}

		nodePath.push(parent);
		current = parent;
	}

	nodePath.reverse();

	// Convert node path to edge path

	const path: FlowEdgeId[] = [];

	for (let i = 0; i < nodePath.length; i++) {
		const from = nodePath[i];
		if (!from) {
			continue;
		}
		const to = nodePath[i + 1];
		if (!to) {
			continue;
		}
		path.push(
			Flow.toFlowEdgeId({
				sourceId: from,
				targetId: to,
			}),
		);
	}

	// Done

	return nodePath;
};

//
// This might cause bugs but it's worth a try for perf
//

const gScore = new Map<FlowNodeId, number>();
const fScore = new Map<FlowNodeId, number>();
const cameFrom = new Map<FlowNodeId, FlowNodeId>();
const openSet = new MinHeap<FlowNodeId>((a, b) => {
	const fScoreA = fScore.get(a) ?? Number.POSITIVE_INFINITY;
	const fScoreB = fScore.get(b) ?? Number.POSITIVE_INFINITY;
	return fScoreA - fScoreB;
});

const findShortestEmptyPipelineAStar = (
	heuristicScore: (node: FlowNodeId) => number,
	model: Flow.Model,
	sourceId: FlowNodeId,
	targetId: FlowNodeId,
): FlowNodeId[] => {
	gScore.clear();
	fScore.clear();
	cameFrom.clear();
	openSet.clear();

	const sourceGroupId = Flow.findGroupIdByFlowNodeId(
		model,
		sourceId,
	);

	if (!sourceGroupId) {
		return [];
	}

	gScore.set(sourceId, 0);
	fScore.set(sourceId, heuristicScore(sourceId));
	openSet.insert(sourceId);

	let iterations = 0;
	while (true) {
		iterations++;
		const current = openSet.extractMin();

		if (!current) {
			break;
		}

		if (current === targetId) {
			return reconstructPath(
				cameFrom,
				current,
			);
		}

		const currentTerminal =
			Flow.findTerminalByFlowNodeId(
				model,
				current,
			);

		if (currentTerminal) {
			return reconstructPath(
				cameFrom,
				current,
			);
		}

		for (const edgeOut of Flow.yieldEdgesOut(
			model,
			current,
		)) {
			const adjacent =
				edgeOut.targetId;

			const adjacentPipe =
				Flow.findPipeByFlowNodeId(
					model,
					adjacent,
				);

			if (adjacentPipe) {
				continue;
			}

			const adjacentTerminal =
				Flow.findTerminalByFlowNodeId(
					model,
					adjacent,
				);

			if (
				adjacentTerminal &&
				adjacentTerminal.groupId !==
					sourceGroupId
			) {
				continue;
			}

			const edgeWeight = 0;

			const tentativeGScore =
				(gScore.get(
					current,
				) ??
					Number.POSITIVE_INFINITY) +
				edgeWeight;

			if (
				tentativeGScore <
				(gScore.get(
					adjacent,
				) ??
					Number.POSITIVE_INFINITY)
			) {
				cameFrom.set(
					adjacent,
					current,
				);
				gScore.set(
					adjacent,
					tentativeGScore,
				);
				fScore.set(
					adjacent,
					tentativeGScore +
						heuristicScore(
							adjacent,
						),
				);

				if (
					!openSet.has(
						adjacent,
					)
				) {
					openSet.insert(
						adjacent,
					);
				}
			}
		}
	}

	return [];
};

const reconstructPath = (
	cameFrom: Map<FlowNodeId, FlowNodeId>,
	start: FlowNodeId,
): FlowNodeId[] => {
	let current = start;
	const totalPath = [current];

	while (cameFrom.has(current)) {
		const got = cameFrom.get(current);
		if (!got) {
			break;
		}
		current = got;
		totalPath.push(current);
	}

	return totalPath.reverse();
};

/**
 * Utility function that takes items from the inputted array until the predicate returns false
 */
export const takeWhile = <T>(
	arr: Iterable<T>,
	predicate: (item: T) => boolean,
): T[] => {
	const results: T[] = [];
	for (const item of arr) {
		if (!predicate(item)) {
			break;
		}
		results.push(item);
	}
	return results;
};

export const uniqueWith = <T>(
	arr: T[],
	fn: (left: T, right: T) => boolean,
): T[] => {
	const unique: T[] = [];
	for (const left of arr) {
		if (!unique.some((right) => fn(left, right))) {
			unique.push(left);
		}
	}
	return unique;
};

export const minAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
	let min = Infinity;
	for (const item of arr) {
		const value = fn(item);
		if (value < min) {
			min = value;
		}
	}
	return arr.filter((item) => fn(item) === min);
};
