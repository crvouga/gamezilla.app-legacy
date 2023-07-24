export type NodeId = string & { readonly __brand: unique symbol };

export type EdgeId = string & { readonly __brand: unique symbol };

export type PathId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q";

export const PATH_ID_ORDER = [
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

export const isPathId = (pathId: string): pathId is PathId => {
  return PATH_ID_ORDER.includes(pathId as PathId);
};

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.from}->${edge.to}` as EdgeId;
};

export const isEdgeId = (
  model: Pick<Model, "edges">,
  edgeId: string
): edgeId is EdgeId => {
  return edgeId in model.edges;
};

export const isNodeId = (
  model: Pick<Model, "nodes">,
  nodeId: string
): nodeId is NodeId => {
  return nodeId in model.nodes;
};

/**
 *
 * Model
 *
 *
 * Represents the entire puzzle.
 * The puzzle is a directed graph
 */
export type Model = {
  /**
   * Represents each cell in the puzzle
   */
  nodes: {
    [nodeId: NodeId]: Node;
  };

  /**
   * Represents all the valid connections between two nodes.
   */
  edges: {
    [edgeId: EdgeId]: Edge;
  };

  /**
   * Represents the start and end node of a path.
   */
  terminals: {
    [pathId in PathId]?: Terminal;
  };

  /**
   * For performance, we index all edges that go into a node.
   *
   * Node: •
   * Edge: ->
   *
   * -> • <-
   *
   **/
  indexEdgesIn: {
    [targetId: NodeId]: {
      [sourceId: NodeId]: EdgeId;
    };
  };

  /**
   * For performance, we index all edges that go out of a node.
   *
   * Node: •
   * Edge: ->
   *
   * <- • ->
   **/
  indexEdgesOut: {
    [sourceId: NodeId]: {
      [targetId: NodeId]: EdgeId;
    };
  };
};

/**
 * Represents a connection between two nodes.
 */
export type Edge = {
  from: NodeId;
  to: NodeId;
  pathId?: PathId | null;
};

/**
 * Represents each cell in the puzzle
 */
export type Node = {
  nodeId: NodeId;
};

/**
 * Represents the start and end node of a path.
 */
export type Terminal = {
  pathId: PathId;
  startId: NodeId;
  endId: NodeId;
};

/**
 *
 *
 */
export const initEmpty: Model = {
  nodes: {},
  terminals: {},
  edges: {},
  indexEdgesIn: {},
  indexEdgesOut: {},
};

/**
 * Finds node
 */
export const toNode = (
  model: Pick<Model, "nodes">,
  nodeId: NodeId
): Node | null => {
  return model.nodes[nodeId] ?? null;
};

/**
 * Finds edge
 */
export const toEdge = (
  model: Pick<Model, "edges">,
  edgeId: EdgeId
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
export const addNode = <T extends Model>(model: T, nodeId: NodeId): T => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [nodeId]: { nodeId },
    },
  };
};

/**
 * Adds an edge to the puzzle.
 */
export const addEdge = <T extends Model>(model: T, edge: Edge): T => {
  return {
    ...model,
    edges: {
      ...model.edges,
      [toEdgeId(edge)]: edge,
    },
    indexEdgesIn: {
      ...model.indexEdgesIn,
      [edge.to]: {
        ...model.indexEdgesIn[edge.to],
        [edge.from]: toEdgeId(edge),
      },
    },
    indexEdgesOut: {
      ...model.indexEdgesOut,
      [edge.from]: {
        ...model.indexEdgesOut[edge.from],
        [edge.to]: toEdgeId(edge),
      },
    },
  };
};

/**
 * Adds a terminal to the puzzle.
 */
export const addTerminal = <T extends Model>(
  model: T,
  terminal: Terminal
): T => {
  return {
    ...addNode(addNode(model, terminal.startId), terminal.endId),
    terminals: {
      ...model.terminals,
      [terminal.pathId]: terminal,
    },
  };
};

/**
 * Sets the start node of the inputted terminal
 */
export const setStartNode = <T extends Model>(
  model: T,
  terminal: Terminal,
  nodeId: NodeId
): T => {
  const terminalNew: Terminal = {
    ...terminal,
    startId: nodeId,
    endId: terminal.endId === nodeId ? terminal.startId : terminal.endId,
  };
  return addTerminal(model, terminalNew);
};

/**
 * Associates an edge with the inputted path.
 */
export const setEdgePath = <T extends Model>(
  model: T,
  edgeId: EdgeId,
  pathId: PathId | null
): T => {
  const edge = model.edges[edgeId];

  if (!edge) {
    return model;
  }

  const edgeNew: Edge = {
    ...edge,
    pathId: pathId,
  };

  return addEdge(model, edgeNew);
};

/**
 * Yields all terminals in the model.
 */
export const yieldTerminals = function* <T extends Model>(
  model: Pick<T, "terminals">
): Generator<Terminal> {
  for (const pathId in model.terminals) {
    if (!isPathId(pathId)) {
      continue;
    }
    const terminal = model.terminals[pathId];
    if (!terminal) {
      continue;
    }
    yield terminal;
  }
};

/**
 * Yields all nodes in the model.
 */
export const yieldNodes = function* (
  model: Pick<Model, "nodes">
): Generator<Node> {
  for (const nodeId in model.nodes) {
    if (!isNodeId(model, nodeId)) {
      continue;
    }

    const node = model.nodes[nodeId];

    if (node) {
      yield node;
    }
  }
};

/**
 * Yields all edges in the model.
 */
export const yieldEdges = function* (
  model: Pick<Model, "edges">
): Generator<Edge> {
  for (const edgeId in model.edges) {
    if (!isEdgeId(model, edgeId)) {
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
export const yieldOutEdges = function* (
  model: Pick<Model, "indexEdgesOut" | "edges" | "nodes">,
  sourceNodeId: NodeId
): Generator<Edge> {
  for (const outNodeId in model.indexEdgesOut[sourceNodeId]) {
    if (!isNodeId(model, outNodeId)) {
      continue;
    }

    const edgeId = model.indexEdgesOut[sourceNodeId]?.[outNodeId];

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
 * Yields all edges where the inputted node is the target node
 */
export const yieldInEdges = function* (
  model: Pick<Model, "indexEdgesIn" | "edges" | "nodes">,
  targetNodeId: NodeId
): Generator<Edge> {
  for (const sourceNodeId in model.indexEdgesIn[targetNodeId]) {
    if (!isNodeId(model, sourceNodeId)) {
      continue;
    }

    const edgeId = model.indexEdgesIn[targetNodeId]?.[sourceNodeId];

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
 * Finds the terminal that contains the inputted node.
 */
export const findTerminal = (
  model: Pick<Model, "terminals">,
  nodeId: NodeId
): Terminal | null => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.startId === nodeId || terminal.endId === nodeId) {
      return terminal;
    }
  }
  return null;
};

/**
 * Finds the path id that the inputted node is associated with.
 */
export const findPath = (
  model: Pick<Model, "indexEdgesIn" | "indexEdgesOut" | "edges" | "nodes">,
  nodeId: NodeId
): PathId | null => {
  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.pathId) {
      return edge.pathId;
    }
  }

  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.pathId) {
      return edge.pathId;
    }
  }

  return null;
};
