import { eq, memoize } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";

//
//
//
//
//
//

export const NodeId = p.brand(p.str, "NodeId");

export type NodeId = p.Infer<typeof NodeId>;

export const createNodeId = (nodeId: string): NodeId => {
	return nodeId as NodeId;
};

export const hasNodeId = (model: Model, nodeId: string): nodeId is NodeId => {
	return nodeId in model.nodes;
};

//
//
//
//
//

export const GROUP_ID_ORDER = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
] as const;

export const isGroupId = (groupId: unknown): groupId is GroupId => {
	return GROUP_ID_ORDER.includes(groupId as GroupId);
};

export const GroupId = p.enumeration(GROUP_ID_ORDER);

export type GroupId = p.Infer<typeof GroupId>;

//
//
//
//
//

export const EdgeId = p.brand(p.str, "EdgeId");

export type EdgeId = p.Infer<typeof EdgeId>;

const EDGE_ID_SEPARATOR = "->";

export const toEdgeId = (edge: Edge): EdgeId => {
	return `${edge.sourceId}${EDGE_ID_SEPARATOR}${edge.targetId}` as EdgeId;
};

export const hasEdgeId = (model: Model, edgeId: string): edgeId is EdgeId => {
	return edgeId in model.edges;
};

export const isEdgeId = (edgeId: unknown): edgeId is EdgeId => {
	return typeof edgeId === "string";
};

//
//
//
//
//
//
//

/**
 * A terminal represents the start and end nodes for a group.
 * These are the two circles the user is trying to connect
 */

export const Terminal = p.obj({
	groupId: GroupId,
	startId: NodeId,
	endId: p.maybe(NodeId),
});
export type Terminal = p.Infer<typeof Terminal>;

export const isSameTerminal = (a: Terminal, b: Terminal): boolean => {
	const startA = a.startId ?? null;
	const startB = b.startId ?? null;
	const endA = a.endId ?? null;
	const endB = b.endId ?? null;
	const isSameNodes =
		(startA === startB && endA === endB) ||
		(endA === startB && startA === endB);
	const isSameGroup = a.groupId === b.groupId;
	const isSame = isSameNodes && isSameGroup;
	return isSame;
};

export const isSameTerminalsByGroupId = (
	a: Model["terminalsByGroupId"],
	b: Model["terminalsByGroupId"],
): boolean => {
	if (Object.keys(a).length !== Object.keys(b).length) {
		return false;
	}
	for (const groupId in a) {
		const terminalA = a[groupId as GroupId];
		if (!terminalA) {
			return false;
		}
		const terminalB = b[groupId as GroupId];
		if (!terminalB) {
			return false;
		}
		if (!isSameTerminal(terminalA, terminalB)) {
			return false;
		}
	}
	return true;
};

export const toReversedPipesBySourceId = (
	model: Pick<Model, "pipesBySourceId" | "edges">,
): Model["pipesBySourceId"] => {
	const reversed: Model["pipesBySourceId"] = {};
	for (const sourceId in model.pipesBySourceId) {
		const pipe = model.pipesBySourceId[sourceId as NodeId];
		if (!pipe) {
			continue;
		}
		const edge = toEdge(model, pipe.edgeId);
		if (!edge) {
			continue;
		}
		reversed[edge.targetId] = {
			edgeId: toEdgeId({
				sourceId: edge.targetId,
				targetId: edge.sourceId,
			}),
			groupId: pipe.groupId,
		};
	}
	return reversed;
};

export const isSamePipesBySourceId = (
	left: Pick<Model, "pipesBySourceId" | "edges">,
	right: Pick<Model, "pipesBySourceId" | "edges">,
): boolean => {
	const isEqual = eq(left.pipesBySourceId, right.pipesBySourceId);
	const reversedB = toReversedPipesBySourceId(right);
	const isEqualReversed = eq(left.pipesBySourceId, reversedB);
	const isSame = isEqual || isEqualReversed;
	return isSame;
};

export const isSame = (left: Model, right: Model): boolean => {
	const nodesLeft = left.nodes;
	const nodesRight = right.nodes;
	const isSameNodes = eq(nodesLeft, nodesRight);

	const edgesLeft = left.edges;
	const edgesRight = right.edges;
	const isSameEdges = eq(edgesLeft, edgesRight);

	const terminalsByGroupIdLeft = left.terminalsByGroupId;
	const terminalsByGroupIdRight = right.terminalsByGroupId;
	const isSameTerminals = isSameTerminalsByGroupId(
		terminalsByGroupIdLeft,
		terminalsByGroupIdRight,
	);

	const isSamePipes = isSamePipesBySourceId(left, right);

	return isSamePipes && isSameNodes && isSameEdges && isSameTerminals;
};

/**
 * Represents a connection between two nodes.
 */
export const Edge = p.obj({
	sourceId: NodeId,
	targetId: NodeId,
});
export type Edge = p.Infer<typeof Edge>;

/**
 * A `Pipe` associates an edge with a group.
 * These are the lines the user draws in the puzzle.
 */
export const Pipe = p.obj({
	groupId: GroupId,
	edgeId: EdgeId,
});
export type Pipe = p.Infer<typeof Pipe>;

export const PipeJoined = p.and(
	Pipe,
	p.obj({
		edge: Edge,
	}),
);
export type PipeJoined = p.Infer<typeof PipeJoined>;

export const Node = p.obj({
	nodeId: NodeId,
});
export type Node = p.Infer<typeof Node>;

export const toNodes = (model: Model): { [nodeId: NodeId]: Node } => {
	return model.nodes;
};

/**
 *
 * Model
 *
 *
 * Represents the entire puzzle.
 * The puzzle is a directed graph
 */

export const Model = p.obj({
	Flow: p.l(true),

	/**
	 * The set of all valid nodes in the puzzle.
	 */
	nodes: p.dict(NodeId, Node),

	/**
	 * The set of all valid connections between nodes.
	 */
	edges: p.dict(EdgeId, Edge),

	/**
	 * Represents the start and end nodes for each group.
	 */
	terminalsByGroupId: p.partialDict(GroupId, Terminal),

	/**
	 * Represents the pipes that are connected to each node.
	 * We index each pipe with pipe's source node
	 * so that it's impossible for a node to be associated with more than one group
	 */
	pipesBySourceId: p.dict(NodeId, Pipe),

	edgeHash: p.maybe(p.or(p.str, p.num)),

	nodeHash: p.maybe(p.or(p.str, p.num)),
});

export type Model = p.Infer<typeof Model>;

/**
 *
 */
export const init: Model = {
	Flow: true,
	nodes: {},
	edges: {},
	terminalsByGroupId: {},
	pipesBySourceId: {},
	edgeHash: 0,
	nodeHash: 0,
};

/**
 * Finds node
 */
export const toNode = (model: Model, nodeId: NodeId): Node | null => {
	return toNodes(model)[nodeId] ?? null;
};

/**
 * Finds edge
 */
export const toEdge = (
	model: Pick<Model, "edges">,
	edgeId: EdgeId,
): Edge | null => {
	const edge = model.edges[edgeId];

	if (!edge) {
		return null;
	}

	return edge;
};

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, node: Node): Model => {
	const modelNew: Model = {
		...model,
		nodes: {
			...model.nodes,
			[node.nodeId]: node,
		},
	};
	const nodeHash = deriveNodeHash(modelNew);
	return {
		...modelNew,
		nodeHash,
	};
};

export const deriveEdgeHash = (edges: Model["edges"]): string | number => {
	return djb2Hash(Object.values(edges).sort().join(","));
};

export const deriveNodeHash = (nodes: Model["nodes"]): string | number => {
	return djb2Hash(Object.values(nodes).sort().join(","));
};

/**
 * Adds an edge to the puzzle.
 */
export const addEdge = (model: Model, edge: Edge): Model => {
	const modelNew: Model = {
		...model,
		edges: {
			...model.edges,
			[toEdgeId(edge)]: edge,
		},
	};
	const edgeHash = deriveEdgeHash(modelNew);
	return { ...modelNew, edgeHash };
};

/**
 *
 */
const hasNode = (model: Model, nodeId: NodeId): boolean => {
	return nodeId in model.nodes;
};

/**
 * @param model
 */
export const addTerminal = (model: Model, terminal: Terminal): Model => {
	if (terminal.endId === terminal.startId) {
		return model;
	}

	if (!hasNode(model, terminal.startId)) {
		return model;
	}

	if (terminal.endId && !hasNode(model, terminal.endId)) {
		return model;
	}

	return {
		...model,
		terminalsByGroupId: {
			...model.terminalsByGroupId,
			[terminal.groupId]: terminal,
		},
	};
};

export const removeTerminal = (model: Model, groupId: GroupId): Model => {
	const terminalsByGroupIdNew = { ...model.terminalsByGroupId };
	delete terminalsByGroupIdNew[groupId];
	return {
		...model,
		terminalsByGroupId: terminalsByGroupIdNew,
	};
};

/**
 * Yields all nodes in the model.
 */
export const yieldNodes = function* (model: Model): Generator<Node> {
	for (const nodeId in model.nodes) {
		const node = model.nodes[nodeId as NodeId];

		if (!node) {
			continue;
		}

		yield node;
	}
};

/**
 *
 */

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
	for (const nodeId in model.pipesBySourceId) {
		const pipe = model.pipesBySourceId[nodeId as NodeId];

		if (!pipe) {
			continue;
		}

		const edge = toEdge(model, pipe.edgeId);

		if (!edge) {
			continue;
		}

		yield {
			...pipe,
			edge,
		};
	}
};

/**
 * Yields all edges in the model.
 */
export const yieldEdges = function* (model: Model): Generator<Edge> {
	for (const edgeId in model.edges) {
		const edge = toEdge(model, edgeId as EdgeId);

		if (!edge) {
			continue;
		}

		yield edge;
	}
};

export const toIndexEdgesOut = (model: Model) => {
	let indexEdgesOut: { [sourceId: NodeId]: { [targetId: NodeId]: EdgeId } } =
		{};

	for (const edge of yieldEdges(model)) {
		indexEdgesOut = {
			...indexEdgesOut,
			[edge.sourceId]: {
				...indexEdgesOut[edge.sourceId],
				[edge.targetId]: toEdgeId(edge),
			},
		};
	}
	return indexEdgesOut;
};

export const toIndexEdgesOutMemoized = memoize({
	toKey: (model) => model.edgeHash ?? 0,
	func: toIndexEdgesOut,
	cacheCapacity: 100,
});

export const toIndexEdgesIn = (model: Model) => {
	let indexEdgesIn: { [targetId: NodeId]: { [sourceId: NodeId]: EdgeId } } = {};

	for (const edge of yieldEdges(model)) {
		indexEdgesIn = {
			...indexEdgesIn,
			[edge.targetId]: {
				...indexEdgesIn[edge.targetId],
				[edge.sourceId]: toEdgeId(edge),
			},
		};
	}
	return indexEdgesIn;
};

/**
 * Yields all edges where the inputted node is the source node
 */
export const yieldEdgesOut = function* (
	model: Model,
	sourceNodeId: NodeId,
): Iterable<Edge> {
	const indexEdgesOut = toIndexEdgesOutMemoized(model);

	for (const targetId in indexEdgesOut[sourceNodeId]) {
		const edgeId = indexEdgesOut[sourceNodeId]?.[targetId as NodeId];

		if (!edgeId) {
			continue;
		}

		const edge = toEdge(model, edgeId);

		if (!edge) {
			continue;
		}

		yield edge;
	}
};

/**
 * Yields all edges where the inputted node is the source node
 */
export const yieldEdgesIn = function* (
	model: Model,
	targetNodeId: NodeId,
): Iterable<Edge> {
	const indexEdgesIn = toIndexEdgesIn(model);
	for (const sourceId in indexEdgesIn[targetNodeId]) {
		if (!hasNodeId(model, sourceId)) {
			continue;
		}

		const edgeId = indexEdgesIn[targetNodeId]?.[sourceId];

		if (!edgeId) {
			continue;
		}

		const edge = toEdge(model, edgeId);

		if (!edge) {
			continue;
		}

		yield edge;
	}
};

/**
 *
 */
export const yieldTerminals = function* (model: Model): Iterable<Terminal> {
	for (const groupId in model.terminalsByGroupId) {
		const terminal = model.terminalsByGroupId[groupId as GroupId];

		if (!terminal) {
			continue;
		}

		yield terminal;
	}
};

export const yieldPipelines = function* (
	model: Model,
): Iterable<Iterable<Pipe>> {
	for (const terminal of yieldTerminals(model)) {
		yield yieldPipeline(model, terminal.startId);
	}
};

export const pipelineToGroupId = (pipeline: Iterable<Pipe>): GroupId | null => {
	for (const pipe of pipeline) {
		return pipe.groupId;
	}
	return null;
};

export type Pipeline = Pipe[];

export const toPipeline = (model: Model, sourceNodeId: NodeId): Pipe[] => {
	const pipe = toPipeBySourceId(model, sourceNodeId);

	if (!pipe) {
		return [];
	}

	return [pipe, ...toPipeline(model, pipe.edge.targetId)];
};

export const yieldPipeline = (
	model: Model,
	startingNodeId: NodeId,
): Iterable<PipeJoined> => {
	const pipeline: PipeJoined[] = [];

	const currentNodeId = startingNodeId;

	while (true) {
		const pipe = toPipeBySourceId(model, currentNodeId);

		if (!pipe) {
			return pipeline;
		}

		pipeline.push(pipe);
	}
};

/**
 *
 */
export const toGroupId = (model: Model, nodeId: NodeId): GroupId | null => {
	for (const terminal of yieldTerminals(model)) {
		if (terminal.startId === nodeId) {
			return terminal.groupId;
		}
		if (terminal.endId === nodeId) {
			return terminal.groupId;
		}
	}

	for (const pipe of yieldPipes(model)) {
		if (pipe.edge.sourceId === nodeId) {
			return pipe.groupId;
		}
		if (pipe.edge.targetId === nodeId) {
			return pipe.groupId;
		}
	}
	return null;
};

export const toPipeBySourceId = (
	model: Model,
	sourceId: NodeId,
): PipeJoined | null => {
	const pipe = model.pipesBySourceId[sourceId];
	if (!pipe) {
		return null;
	}
	const edge = toEdge(model, pipe.edgeId);
	if (!edge) {
		return null;
	}
	return {
		...pipe,
		edge,
	};
};

export const hasEdge = (
	model: Model,
	sourceId: NodeId,
	targetId: NodeId,
): boolean => {
	return toEdgeId({ sourceId, targetId }) in model.edges;
};

/**
 * Finds the terminal associated with the inputted group.
 */
export const toTerminalByGroupId = (
	model: Model,
	groupId: GroupId,
): Terminal | null => {
	return model.terminalsByGroupId[groupId] ?? null;
};

export const toIndexTerminalByEndId = (_model: Model) => {
	// TODO
	return {};
};

export const randomNode = (model: Model): Node | null => {
	const nodes = Object.values(model.nodes);

	if (nodes.length === 0) {
		return null;
	}

	return nodes[Math.floor(Math.random() * nodes.length)] ?? null;
};

export const randomTerminal = (model: Model): Terminal | null => {
	const terminals = Object.values(model.terminalsByGroupId);

	if (terminals.length === 0) {
		return null;
	}

	return terminals[Math.floor(Math.random() * terminals.length)] ?? null;
};

export const randomOutEdge = (model: Model, nodeId: NodeId): Edge | null => {
	const edges = Array.from(yieldEdgesOut(model, nodeId));
	const randomEdge = edges[Math.floor(Math.random() * edges.length)];
	return randomEdge ?? null;
};

/**
 * Find the terminal where the inputted node id is either the start or end node.
 */
export const findTerminalByNodeId = (
	model: Model,
	nodeId: NodeId,
): Terminal | null => {
	for (const terminal of yieldTerminals(model)) {
		if (terminal.startId === nodeId) {
			return terminal;
		}
		if (terminal.endId === nodeId) {
			return terminal;
		}
	}
	return null;
};
export const findPipeByNodeId = (
	model: Model,
	nodeId: NodeId,
): PipeJoined | null => {
	for (const pipe of yieldPipes(model)) {
		if (pipe.edge.sourceId === nodeId) {
			return pipe;
		}
		if (pipe.edge.targetId === nodeId) {
			return pipe;
		}
	}
	return null;
};

/**
 *
 */
export const addPipe = (model: Model, pipe: Pipe): Model | null => {
	const edge = toEdge(model, pipe.edgeId);

	if (!edge) {
		return null;
	}

	return {
		...model,
		pipesBySourceId: {
			...model.pipesBySourceId,
			[edge.sourceId]: pipe,
		},
	};
};

export const findGroupIdByNodeId = (
	model: Model,
	nodeId: NodeId,
): GroupId | null => {
	const terminal = findTerminalByNodeId(model, nodeId);

	if (terminal) {
		return terminal.groupId;
	}

	const pipe = findPipeByNodeId(model, nodeId);

	if (pipe) {
		return pipe.groupId;
	}

	return null;
};

/**
 * Flips the start and end nodes of the inputted terminal.
 */
export const flipTerminal = (model: Model, terminal: Terminal): Model => {
	if (!terminal.endId) {
		return model;
	}

	const terminalNew: Terminal = {
		...terminal,
		startId: terminal.endId,
		endId: terminal.startId,
	};

	return {
		...model,
		terminalsByGroupId: {
			...model.terminalsByGroupId,
			[terminal.groupId]: terminalNew,
		},
	};
};

function djb2Hash(str: string) {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) + hash + char; /* hash * 33 + c */
	}
	return hash;
}
