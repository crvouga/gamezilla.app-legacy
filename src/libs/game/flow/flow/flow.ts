import { removeKey } from "@gamezilla/core";

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

//
//
//
// Model
//
//
//

export type Model = {
  nodes: {
    [nodeId: NodeId]: Node;
  };

  /**
   * Represents the start and end node of a path.
   */
  terminals: {
    [pathId in PathId]?: Terminal;
  };

  /**
   *
   */
  edges: {
    [edgeId: EdgeId]: Edge;
  };

  /**
   * Edge index to get all edges that go into a node.
   *
   * -> • <-
   *
   **/
  edgesIn: {
    [to: NodeId]: {
      [from: NodeId]: EdgeId;
    };
  };

  /**
   * Edge index to get all edges that go out of a node.
   *
   * <- • ->
   *
   **/
  edgesOut: {
    [from: NodeId]: {
      [to: NodeId]: EdgeId;
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

export type Terminal = {
  pathId: PathId;
  pair: [NodeId, NodeId];
};

export const isTerminalNode = (model: Model, nodeId: NodeId): boolean => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.pair.includes(nodeId)) {
      return true;
    }
  }
  return false;
};

export const isStartNode = <T extends Model>(
  model: T,
  nodeId: NodeId
): boolean => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.pair[0] === nodeId) {
      return true;
    }
  }
  return false;
};

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

//
//
//
// Init
//
//
//

export const initEmpty: Model = {
  nodes: {},
  terminals: {},
  edges: {},
  edgesIn: {},
  edgesOut: {},
};

//
//
//
// Basic Operations
//
//
//

export const toNode = (
  model: Pick<Model, "nodes">,
  nodeId: NodeId
): Node | null => {
  return model.nodes[nodeId] ?? null;
};

export type EdgeFull = Edge & {
  nodeFrom: Node;
  nodeTo: Node;
};

export const toEdge = (
  model: Pick<Model, "edges" | "nodes">,
  edgeId: EdgeId
): EdgeFull | null => {
  const edge = model.edges[edgeId];

  if (!edge) {
    return null;
  }

  const nodeFrom = model.nodes[edge.from];

  if (!nodeFrom) {
    return null;
  }

  const nodeTo = model.nodes[edge.to];

  if (!nodeTo) {
    return null;
  }

  return { ...edge, nodeFrom, nodeTo };
};

export const addNode = <T extends Model>(model: T, nodeId: NodeId): T => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [nodeId]: { nodeId },
    },
  };
};

export const addEdge = <T extends Model>(model: T, edge: Edge): T => {
  return {
    ...model,
    edges: {
      ...model.edges,
      [toEdgeId(edge)]: edge,
    },
    edgesIn: {
      ...model.edgesIn,
      [edge.to]: {
        ...model.edgesIn[edge.to],
        [edge.from]: toEdgeId(edge),
      },
    },
    edgesOut: {
      ...model.edgesOut,
      [edge.from]: {
        ...model.edgesOut[edge.from],
        [edge.to]: toEdgeId(edge),
      },
    },
  };
};

export const removeNode = <T extends Model>(model: T, nodeId: NodeId): T => {
  return {
    ...model,
    nodes: removeKey(nodeId, model.nodes),
  };
};

export const setTerminalStartNode = <T extends Model>(
  model: T,
  nodeId: NodeId,
  pathId: PathId
): T => {
  const added = addNode(model, nodeId);
  return {
    ...added,
    terminals: {
      ...added.terminals,
      [pathId]: {
        pathId,
        pair: [nodeId, added.terminals[pathId]?.pair[1]],
      },
    },
  };
};

export const setTerminalEndNode = <T extends Model>(
  model: T,
  nodeId: NodeId,
  pathId: PathId
): T => {
  const terminal = model.terminals[pathId];

  if (!terminal) {
    return model;
  }

  return {
    ...model,
    terminals: {
      ...model.terminals,
      [pathId]: {
        pathId: terminal.pathId,
        pair: [terminal.pair[0], nodeId],
      },
    },
  };
};

export const removeTerminalNode = <T extends Model>(
  model: T,
  nodeId: NodeId
): T => {
  return {
    ...model,
    terminals: Object.entries(model.terminals).reduce(
      (acc, [pathId, terminal]) => {
        if (terminal.pair[0] === nodeId) {
          return acc;
        }
        return {
          ...acc,
          [pathId]: terminal,
        };
      },
      {}
    ),
  };
};

export const isNodeInPath = (
  model: Model,
  nodeId: NodeId,
  pathId: PathId
): boolean => {
  return Boolean(model.terminals[pathId]?.pair.includes(nodeId));
};

export const pathIdToTerminal = (
  model: Model,
  pathId: PathId
): Terminal | null => {
  return model.terminals[pathId] ?? null;
};

export const toggleNodePath = <T extends Model>(
  model: T,
  nodeId: NodeId,
  pathId: PathId
): T => {
  if (isNodeInPath(model, nodeId, pathId)) {
    return removeTerminalNode(model, nodeId);
  }
  return setTerminalStartNode(model, nodeId, pathId);
};

export const includesNode = (model: Model, nodeId: NodeId): boolean => {
  return nodeId in model.nodes;
};

export const setEdgePath = <T extends Model>(
  model: T,
  edgeId: EdgeId,
  pathId: PathId | null
): T => {
  const edge = model.edges[edgeId];

  if (!edge) {
    return model;
  }

  return {
    ...model,
    edges: {
      ...model.edges,
      [edgeId]: {
        ...edge,
        pathId: pathId,
      },
    },
  };
};

export const modelToKey = (model: Model): string => {
  const nodeIds = Object.keys(model.nodes).sort();
  const edgeIds = Object.entries(model.edges)
    .reduce<string[]>((acc, [from, nodes]) => {
      const nodeIds = Object.keys(nodes).sort();
      return [...acc, ...nodeIds.map((to) => `${from}-${to}`)];
    }, [])
    .sort();
  return `${nodeIds.join(",")}|${edgeIds.join(",")}`;
};

//
//
//
//
//
//
//

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

export const yieldEdges = function* (
  model: Pick<Model, "nodes" | "edges">
): Generator<EdgeFull> {
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

export const nodeToTerminal = (
  model: Pick<Model, "terminals">,
  nodeId: NodeId
): Terminal | null => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.pair.includes(nodeId)) {
      return terminal;
    }
  }
  return null;
};

export const yieldOutEdges = function* (
  model: Pick<Model, "edgesOut" | "edges" | "nodes">,
  nodeId: NodeId
): Generator<EdgeFull> {
  for (const outNodeId in model.edgesOut[nodeId]) {
    if (!isNodeId(model, outNodeId)) {
      continue;
    }

    const edgeId = model.edgesOut[nodeId]?.[outNodeId];

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

export const yieldInEdges = function* (
  model: Pick<Model, "edgesIn" | "edges" | "nodes">,
  nodeId: NodeId
): Generator<EdgeFull> {
  for (const inNodeId in model.edgesIn[nodeId]) {
    if (!isNodeId(model, inNodeId)) {
      continue;
    }

    const edgeId = model.edgesIn[nodeId]?.[inNodeId];

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
export const doesPathExist = (
  model: Model,
  nodeId: NodeId,
  targetId: NodeId,
  visited = new Set<NodeId>()
): boolean => {
  const targetTerminal = nodeToTerminal(model, targetId);
  if (!targetTerminal) {
    return false;
  }

  const targetpathId = targetTerminal.pathId;

  if (visited.has(nodeId)) {
    return false;
  }

  visited.add(nodeId);

  if (nodeId === targetId) {
    return true;
  }

  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathId !== targetpathId) {
      continue;
    }

    if (doesPathExist(model, outEdge.to, targetId, visited)) {
      return true;
    }
  }

  return false;
};

export const nodeToPath = (
  model: Pick<Model, "edgesIn" | "edgesOut" | "edges" | "nodes">,
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

export const toStartNodeId = (model: Model, pathId: PathId): NodeId | null => {
  const terminal = model.terminals[pathId];

  if (!terminal) {
    return null;
  }

  return terminal.pair[0];
};
