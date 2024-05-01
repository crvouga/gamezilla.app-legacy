import { p } from "gamezilla-app/@/core/parser";
import { Flow } from "../../flow";
import * as FlowGridDimensions from "./flow-grid-dimensions";
import { DELTAS, Position } from "./flow-grid-position";

//
//
//
// Model
//
//
//

export const Model = p.and(
	Flow.Model,
	FlowGridDimensions.Model,
	p.obj({
		t: p.l("flow-grid"),
		positions: p.dict(Flow.NodeId, Position.parser),
	}),
);
export type Model = p.Infer<typeof Model>;

export const positionToNodeId = (position: Position): Flow.NodeId => {
	return Flow.createNodeId(`${position.x},${position.y}`);
};

export const distance =
	(model: Model) =>
	(a: Flow.NodeId, b: Flow.NodeId): number => {
		const positionA = model.positions[a];

		if (!positionA) {
			return Number.POSITIVE_INFINITY;
		}

		const positionB = model.positions[b];

		if (!positionB) {
			return Number.POSITIVE_INFINITY;
		}

		return Position.distance(positionA, positionB);
	};

//
//
//
// Init
//
//
//

export const init = (input: {
	dimensions: FlowGridDimensions.Model;
	terminalsByGroupId?: Flow.Model["terminalsByGroupId"];
}): Model => {
	let model: Model = {
		...Flow.init,
		t: "flow-grid",
		width: input.dimensions.width,
		height: input.dimensions.height,
		positions: {},
	};

	//
	// Add nodes
	//

	for (let x = 0; x < input.dimensions.width; x++) {
		for (let y = 0; y < input.dimensions.height; y++) {
			const position: Position = { x, y };
			model = addNode(model, position);
		}
	}

	//
	// Add edges
	//

	for (const nodePosition of yieldPositions(model)) {
		for (const delta of DELTAS) {
			const to: Position = {
				x: nodePosition.x + delta.x,
				y: nodePosition.y + delta.y,
			};

			if (!model.nodes[positionToNodeId(to)]) {
				continue;
			}

			const edge: Flow.Edge = {
				sourceId: positionToNodeId(nodePosition),
				targetId: positionToNodeId(to),
			};

			model = { ...model, ...Flow.addEdge(model, edge) };
		}
	}

	//
	// Terminals
	//

	const terminalsByGroupIdNew: Flow.Model["terminalsByGroupId"] = {};

	for (const groupId in input.terminalsByGroupId) {
		const terminal = input.terminalsByGroupId[groupId as Flow.GroupId];

		if (!terminal) {
			continue;
		}

		const start = toNode(model, terminal.startId);

		const end = terminal?.endId ? toNode(model, terminal.endId) : null;

		const startNew = start?.nodeId ?? end?.nodeId;
		const endNew = end?.nodeId === startNew ? null : end?.nodeId;

		if (!startNew) {
			continue;
		}

		const terminalNew: Flow.Terminal = {
			groupId: terminal.groupId,
			startId: startNew,
			endId: endNew,
		};

		terminalsByGroupIdNew[terminalNew.groupId] = terminalNew;
	}

	model.terminalsByGroupId = terminalsByGroupIdNew;

	//
	//
	//

	return model;
};

//
//
//
// Accessors
//
//
//

export type Node = Flow.Node & Position;

export type Edge = Flow.Edge & {
	source: Node;
	target: Node;
};

export const toNode = (model: Model, nodeId: Flow.NodeId): Node | null => {
	const node = Flow.toNode(model, nodeId);

	if (!node) {
		return null;
	}

	const position = model.positions[node.nodeId];

	if (!position) {
		return null;
	}

	return {
		...position,
		...node,
	};
};

export const toEdge = (model: Model, edgeId: Flow.EdgeId): Edge | null => {
	const edge = Flow.toEdge(model, edgeId);

	if (!edge) {
		return null;
	}

	const source = toNode(model, edge.sourceId);

	if (!source) {
		return null;
	}

	const target = toNode(model, edge.targetId);

	if (!target) {
		return null;
	}

	return {
		...edge,
		source: source,
		target: target,
	};
};

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, position: Position): Model => {
	const nodeId = positionToNodeId(position);
	const added = Flow.addNode(model, { nodeId });
	return {
		...model,
		...added,
		positions: {
			...model.positions,
			[nodeId]: position,
		},
	};
};

export const yieldPositions = function* (model: Model): Generator<Position> {
	for (const node of Flow.yieldNodes(model)) {
		const position = model.positions[node.nodeId];
		if (!position) {
			continue;
		}
		yield position;
	}
};

export const yieldEdges = function* (model: Model): Generator<Edge> {
	for (const edge of Flow.yieldEdges(model)) {
		const source = toNode(model, edge.sourceId);

		if (!source) {
			continue;
		}

		const target = toNode(model, edge.targetId);

		if (!target) {
			continue;
		}

		yield { ...edge, source, target };
	}
};

export const yieldNodes = function* (model: Model): Generator<Node> {
	for (const node of Flow.yieldNodes(model)) {
		const position = model.positions[node.nodeId];
		if (!position) {
			continue;
		}
		yield { ...position, ...node };
	}
};

export type Terminal = Flow.Terminal & {
	start: Node;
	end?: Node | null;
};

export const yieldTerminals = function* (model: Model): Generator<Terminal> {
	for (const terminal of Flow.yieldTerminals(model)) {
		const start = toNode(model, terminal.startId);

		if (!start) {
			continue;
		}

		const end = terminal.endId ? toNode(model, terminal.endId) ?? null : null;

		yield { ...terminal, start, end };
	}
};

export type PipeJoined = Flow.PipeJoined & {
	source: Node;
	target: Node;
};

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
	for (const pipe of Flow.yieldPipes(model)) {
		const source = toNode(model, pipe.edge.sourceId);

		if (!source) {
			continue;
		}

		const target = toNode(model, pipe.edge.targetId);

		if (!target) {
			continue;
		}

		yield {
			...pipe,
			source,
			target,
		};
	}
};

export const yieldPipelines = function* (
	model: Model,
): Iterable<Iterable<PipeJoined>> {
	for (const terminal of Flow.yieldTerminals(model)) {
		yield toPipeline(model, terminal.startId);
	}
};

export const toPipeline = (
	model: Model,
	startingNodeId: Flow.NodeId,
): PipeJoined[] => {
	const pipeline: PipeJoined[] = [];

	let currentNodeId = startingNodeId;

	while (true) {
		const pipe = Flow.toPipeBySourceId(model, currentNodeId);

		if (!pipe) {
			return pipeline;
		}
		const source = toNode(model, pipe.edge.sourceId);

		if (!source) {
			return pipeline;
		}

		const target = toNode(model, pipe.edge.targetId);

		if (!target) {
			return pipeline;
		}

		pipeline.push({ ...pipe, source, target });

		currentNodeId = pipe.edge.targetId;
	}
};
