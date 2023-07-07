import { removeKey } from "@gamezilla/shared/core";

export type NodeId = string & { readonly __brand: unique symbol };

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

export const groupIdOrder = [
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
  return groupIdOrder.includes(groupId as GroupId);
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

  terminals: {
    [groupId in GroupId]?: Terminal;
  };

  edges: {
    [edgeId: EdgeId]: Edge;
  };

  edgesIn: {
    [from: NodeId]: {
      [to: NodeId]: EdgeId;
    };
  };

  edgesOut: {
    [to: NodeId]: {
      [from: NodeId]: EdgeId;
    };
  };
};

export type Edge = {
  from: NodeId;
  to: NodeId;
  groupId?: GroupId | null;
};

export type Node = {
  nodeId: NodeId;
};

export type Terminal = {
  groupId: GroupId;
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

export const isTerminalStartNode = <T extends Model>(
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
  for (const groupId in model.terminals) {
    if (!isGroupId(groupId)) {
      continue;
    }
    const terminal = model.terminals[groupId];
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
  groupId: GroupId
): T => {
  const added = addNode(model, nodeId);
  return {
    ...added,
    terminals: {
      ...added.terminals,
      [groupId]: {
        groupId,
        pair: [nodeId, added.terminals[groupId]?.pair[1]],
      },
    },
  };
};

export const setTerminalEndNode = <T extends Model>(
  model: T,
  nodeId: NodeId,
  groupId: GroupId
): T => {
  const terminal = model.terminals[groupId];

  if (!terminal) {
    return model;
  }

  return {
    ...model,
    terminals: {
      ...model.terminals,
      [groupId]: {
        groupId: terminal.groupId,
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
      (acc, [groupId, terminal]) => {
        if (terminal.pair[0] === nodeId) {
          return acc;
        }
        return {
          ...acc,
          [groupId]: terminal,
        };
      },
      {}
    ),
  };
};

export const isNodeInGroup = (
  model: Model,
  nodeId: NodeId,
  groupId: GroupId
): boolean => {
  return Boolean(model.terminals[groupId]?.pair.includes(nodeId));
};

export const groupIdToTerminal = (
  model: Model,
  groupId: GroupId
): Terminal | null => {
  return model.terminals[groupId] ?? null;
};

export const toggleNodeGroup = <T extends Model>(
  model: T,
  nodeId: NodeId,
  groupId: GroupId
): T => {
  if (isNodeInGroup(model, nodeId, groupId)) {
    return removeTerminalNode(model, nodeId);
  }
  return setTerminalStartNode(model, nodeId, groupId);
};

export const includesNode = (model: Model, nodeId: NodeId): boolean => {
  return nodeId in model.nodes;
};

export const setEdgeGroup = <T extends Model>(
  model: T,
  edgeId: EdgeId,
  groupId: GroupId | null
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
        groupId: groupId,
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

export const nodeIdToTerminal = (
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
  const targetTerminal = nodeIdToTerminal(model, targetId);
  if (!targetTerminal) {
    return false;
  }

  const targetGroupId = targetTerminal.groupId;

  if (visited.has(nodeId)) {
    return false;
  }

  visited.add(nodeId);

  if (nodeId === targetId) {
    return true;
  }

  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId !== targetGroupId) {
      continue;
    }

    if (doesPathExist(model, outEdge.to, targetId, visited)) {
      return true;
    }
  }

  return false;
};

export const toGroup = (
  model: Pick<Model, "edgesIn" | "edgesOut" | "edges" | "nodes">,
  nodeId: NodeId
): GroupId | null => {


  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.groupId) {
      return edge.groupId;
    }
  }

  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.groupId) {
      return edge.groupId;
    }
  }

  return null;
};

export const toStartNodeId = (
  model: Model,
  groupId: GroupId
): NodeId | null => {
  const terminal = model.terminals[groupId];

  if (!terminal) {
    return null;
  }

  return terminal.pair[0];
};
