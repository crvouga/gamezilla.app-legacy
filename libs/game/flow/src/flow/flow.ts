export type NodeId = string & { readonly __brand: unique symbol };

export type EdgeId = string & { readonly __brand: unique symbol };

export const toEdgeId = (edge: Edge): EdgeId => {
  return `${edge.from}-${edge.to}` as EdgeId;
};

export const isEdgeId = (model: Model, id: string): id is EdgeId => {
  return id in model.edges;
};

export const isNodeId = (model: Model, id: string): id is NodeId => {
  return id in model.nodes;
};

export type Color = string;

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
  color?: Color | null;
};

export type Node = TerminalNode | EmptyNode;

export type TerminalNode = {
  id: NodeId;
  color: Color;
  type?: 'start' | null;
};

export type EmptyNode = {
  id: NodeId;
};

export const isTerminal = (node: Node): node is TerminalNode => {
  return 'color' in node;
};

export const isStart = (node: Node): node is TerminalNode => {
  return isTerminal(node) && node.type === 'start';
};

export const isEmpty = (node: Node): node is EmptyNode => {
  return !isTerminal(node);
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

export const setNode = <T extends Model>(model: T, node: Node): T => {
  return {
    ...model,
    nodes: {
      ...model.nodes,
      [node.id]: node,
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

export const setEdgeColor = <T extends Model>(
  model: T,
  edgeId: EdgeId,
  color: Color | null
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
        color: color,
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

export const yieldTerminalNodes = function* (
  model: Model
): Generator<TerminalNode> {
  for (const node of yieldNodes(model)) {
    if (isTerminal(node)) {
      yield node;
    }
  }
};

export const yieldEmptyNodes = function* (model: Model): Generator<EmptyNode> {
  for (const node of yieldNodes(model)) {
    if (isEmpty(node)) {
      yield node;
    }
  }
};

export const findEndNode = (
  puzzle: Model,
  start: TerminalNode
): TerminalNode | null => {
  for (const node of yieldTerminalNodes(puzzle)) {
    if (node.id === start.id) {
      continue;
    }

    if (node.color === start.color) {
      return node;
    }
  }

  return null; // invalid model
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
export const doesColoredPathExist = (
  model: Model,
  nodeId: NodeId,
  target: TerminalNode,
  visited = new Set<NodeId>()
): boolean => {
  if (visited.has(nodeId)) {
    return false;
  }

  visited.add(nodeId);

  if (nodeId === target.id) {
    return true;
  }

  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.color !== target.color) {
      continue;
    }

    if (doesColoredPathExist(model, outEdge.to, target, visited)) {
      return true;
    }
  }

  return false;
};

//
//
//
// Initial Path
//
//
//

export const initPath = <T extends Model>(
  model: T,
  terminal: TerminalNode
): T => {
  const cleared = clearEdges(
    clearTerminalNodes(model, terminal.color),
    terminal.color
  );
  const startNode: TerminalNode = {
    id: terminal.id,
    color: terminal.color,
    type: 'start',
  };
  return setNode(cleared, startNode);
};

const clearEdges = <T extends Model>(model: T, color: Color): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.color === color) {
      modelNew = setEdgeColor(modelNew, toEdgeId(edge), null);
    }
  }
  return modelNew;
};

const clearTerminalNodes = <T extends Model>(model: T, color: Color): T => {
  let modelNew: T = model;

  for (const terminal of yieldTerminalNodes(model)) {
    if (terminal.color === color) {
      modelNew = setNode(modelNew, {
        ...terminal,
        type: null,
      });
    }
  }

  return modelNew;
};

//
//
//
// Extend Path
//
//
//

/*

Algorithm:
1. Find the path start for the color.
2.


*/

export const extendPath = <T extends Model>(
  model: T,
  color: Color,
  targetNodeId: NodeId
): T => {
  if (hasPathColor(model, targetNodeId)) {
    return model;
  }

  const node = toNode(model, targetNodeId);

  if (!node) {
    return model;
  }

  if (isTerminal(node) && node.color !== color) {
    return model;
  }

  const pathStart = findPathStart(model, color);

  if (!pathStart) {
    return model;
  }

  const cleared = clearEdges(model, color);

  const walked = extendPathWalk(
    { targetNodeId, color, model },
    cleared,
    pathStart
  );

  return walked;
};

const extendPathWalk = <T extends Model>(
  ctx: { targetNodeId: NodeId; color: Color; model: T },
  model: T,
  node: Node
): T => {
  if (ctx.targetNodeId === node.id) {
    return model;
  }

  if (isTerminal(node) && !isStart(node)) {
    return model;
  }

  const edge = findOutEdgeByColor(model, node.id, ctx.color);

  if (!edge) {
    const edgeId = toEdgeId({ from: node.id, to: ctx.targetNodeId });
    return setEdgeColor(model, edgeId, ctx.color);
  }

  if (hasPathColor(model, edge.to)) {
    return model;
  }

  const edgeId = toEdgeId({ from: node.id, to: edge.to });

  const updated = setEdgeColor(model, edgeId, ctx.color);

  return extendPathWalk(ctx, updated, edge.nodeTo);
};

export const findShortestEmptyPath = <T extends Model>(
  _model: T,
  _color: Color,
  _start: NodeId,
  _end: NodeId
): EdgeId[] => {
  return [];
};

export const hasPathColor = (model: Model, nodeId: NodeId): boolean => {
  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.color) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.color) {
      return true;
    }
  }

  return false;
};

const findOutEdgeByColor = <T extends Model>(
  model: T,
  nodeId: NodeId,
  color: Color
): EdgeFull | null => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.color === color) {
      return outEdge;
    }
  }
  return null;
};

export const findPathStart = (model: Model, color: Color): Node | null => {
  for (const terminal of yieldTerminalNodes(model)) {
    if (terminal.color === color && terminal.type === 'start') {
      return terminal;
    }
  }
  return null;
};

export const findPathEnd = (
  model: Model,
  color: Color,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.color !== color) {
      continue;
    }

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findPathEnd(model, color, outEdge.to);
  }

  return nodeId;
};

//
//
//
//
//
//
//

export const toPathColor = (model: Model, nodeId: NodeId): Color | null => {
  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.color) {
      return edge.color;
    }
  }

  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.color) {
      return edge.color;
    }
  }

  return null;
};

export const isPathDone = (model: Model, color: Color): boolean => {
  const pathStart = findPathStart(model, color);

  if (!pathStart) {
    return false;
  }

  const pathEndId = findPathEnd(model, color, pathStart.id);

  if (!pathEndId) {
    return false;
  }

  const pathEnd = toNode(model, pathEndId);

  if (!pathEnd) {
    return false;
  }

  return isTerminal(pathEnd);
};
