import { removeKey } from '@gamezilla/shared/core';

export type NodeId = string & { readonly __brand: unique symbol };

export type EdgeId = string & { readonly __brand: unique symbol };

export type GroupId =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q';

export const groupIdOrder = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
] as const;

export const isGroupId = (id: string): id is GroupId => {
  return groupIdOrder.includes(id as GroupId);
};

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.from}-${edge.to}` as EdgeId;
};

export const isEdgeId = (model: Model, id: string): id is EdgeId => {
  return id in model.edges;
};

export const isNodeId = (model: Model, id: string): id is NodeId => {
  return id in model.nodes;
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
    [id: NodeId]: Node;
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
  start: NodeId;
  end?: NodeId | null;
};

export const isTerminalNode = (model: Model, nodeId: NodeId): boolean => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.start === nodeId || terminal.end === nodeId) {
      return true;
    }
  }
  return false;
};

export const isTerminalStartNode = (model: Model, nodeId: NodeId): boolean => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.start === nodeId) {
      return true;
    }
  }
  return false;
};

export const yieldTerminals = function* (model: Model): Generator<Terminal> {
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

export const toNode = (model: Model, id: NodeId): Node | null => {
  return model.nodes[id] ?? null;
};

export type EdgeFull = Edge & {
  nodeFrom: Node;
  nodeTo: Node;
};

export const toEdge = (model: Model, edgeId: EdgeId): EdgeFull | null => {
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

export const addTerminalNode = <T extends Model>(
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
        ...added.terminals[groupId],
        groupId,
        start: nodeId,
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
        if (terminal.start === nodeId) {
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
  return model.terminals[groupId]?.start === nodeId;
};

export const toggleNodeGroup = <T extends Model>(
  model: T,
  nodeId: NodeId,
  groupId: GroupId
): T => {
  if (isNodeInGroup(model, nodeId, groupId)) {
    return removeTerminalNode(model, nodeId);
  }
  return addTerminalNode(model, nodeId, groupId);
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
  return `${nodeIds.join(',')}|${edgeIds.join(',')}`;
};

//
//
//
//
//
//
//

export const yieldNodes = function* (model: Model): Generator<Node> {
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

export const yieldEdges = function* (model: Model): Generator<EdgeFull> {
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
  model: Model,
  nodeId: NodeId
): Terminal | null => {
  for (const terminal of yieldTerminals(model)) {
    if (terminal.start === nodeId || terminal.end === nodeId) {
      return terminal;
    }
  }
  return null;
};

export const yieldOutEdges = function* (
  model: Model,
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
  model: Model,
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

export const toGroup = (model: Model, nodeId: NodeId): GroupId | null => {
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

  return terminal.start;
};
