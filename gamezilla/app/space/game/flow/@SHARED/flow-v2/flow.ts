export type NodeId = string & { readonly __brand: unique symbol };

export const createNodeId = (nodeId: string): NodeId => {
  return nodeId as NodeId;
};

export type EdgeId = string & { readonly __brand: unique symbol };

export type GroupId =
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

export const isGroupId = (groupId: string): groupId is GroupId => {
  return PATH_ID_ORDER.includes(groupId as GroupId);
};

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.sourceId}->${edge.targetId}` as EdgeId;
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
  sourceId: NodeId;
  targetId: NodeId;
};

export type EdgeJoined = Edge & {
  source: Node;
  target: Node;
};

/**
 * Represents each cell in the puzzle
 */
export type Node = EmptyNode | StartNode | PathNode | EndNode;

export type EmptyNode = {
  t: "empty";
  nodeId: NodeId;
};

export type StartNode = {
  t: "start";
  nodeId: NodeId;
  groupId: GroupId;
  nextId?: NodeId | null;
};

export type PathNode = {
  t: "path";
  groupId: GroupId;
  nodeId: NodeId;
  prevId: NodeId;
  nextId?: NodeId | null;
};

export type EndNode = {
  t: "end";
  groupId: GroupId;
  nodeId: NodeId;
};

/**
 *
 *
 */
export const init: Model = {
  nodes: {},
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
 * Finds edge
 */
export const toEdgeJoined = (
  model: Pick<Model, "edges" | "nodes">,
  edgeId: EdgeId
): EdgeJoined | null => {
  const edge = model.edges[edgeId];

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

  return { ...edge, source, target };
};

/**
 * Adds a node to the puzzle.
 */
export const addNode = <T extends Model>(model: T, node: Node): T => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [node.nodeId]: node,
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
      [edge.targetId]: {
        ...model.indexEdgesIn[edge.targetId],
        [edge.sourceId]: toEdgeId(edge),
      },
    },
    indexEdgesOut: {
      ...model.indexEdgesOut,
      [edge.sourceId]: {
        ...model.indexEdgesOut[edge.sourceId],
        [edge.targetId]: toEdgeId(edge),
      },
    },
  };
};

export const mapNodes = <T extends Model>(
  model: T,
  fn: (node: Node) => Node
): T => {
  let modelNew = { ...model };
  for (const node of yieldNodes(model)) {
    modelNew = addNode(model, fn(node));
  }
  return modelNew;
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
): Generator<EdgeJoined> {
  for (const outNodeId in model.indexEdgesOut[sourceNodeId]) {
    if (!isNodeId(model, outNodeId)) {
      continue;
    }

    const edgeId = model.indexEdgesOut[sourceNodeId]?.[outNodeId];

    if (!edgeId) {
      continue;
    }

    const edge = toEdgeJoined(model, edgeId);

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
 *
 */
export const toGroupId = (model: Model, nodeId: NodeId): GroupId | null => {
  const node = toNode(model, nodeId);
  switch (node?.t) {
    case undefined:
    case "empty":
      return null;
    case "end":
    case "path":
    case "start":
      return node.groupId;
  }
};
