import { Color } from './flow-color';

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
  pathColor?: Color | null;
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

export const setEdgePathColor = <T extends Model>(
  model: T,
  edgeId: EdgeId,
  pathColor: Color | null
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
        pathColor: pathColor,
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
    if (outEdge.pathColor !== target.color) {
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
//  Path
//
//
//

export const startPath = <T extends Model>(
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
    if (edge.pathColor === color) {
      modelNew = setEdgePathColor(modelNew, toEdgeId(edge), null);
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

export const extendPath = <T extends Model>(
  model: T,
  pathColor: Color,
  targetNodeId: NodeId
): T => {
  const targetNodePathColor = toPathColor(model, targetNodeId);
  if (targetNodePathColor && targetNodePathColor !== pathColor) {
    return model;
  }

  const node = toNode(model, targetNodeId);

  if (!node) {
    return model;
  }

  if (isTerminal(node) && node.color !== pathColor) {
    return model;
  }

  const pathStart = findPathStart(model, pathColor);

  if (!pathStart) {
    return model;
  }

  const modelWithoutPath = clearEdges(model, pathColor);

  const walked = extendPathWalk({
    targetNodeId,
    pathColor,
    modelWithPath: model,
    model: modelWithoutPath,
    currentNode: pathStart,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  targetNodeId,
  pathColor,
  modelWithPath,
  model,
  currentNode,
}: {
  targetNodeId: NodeId;
  pathColor: Color;
  modelWithPath: T;
  model: T;
  currentNode: Node;
}): T => {
  if (currentNode.id === targetNodeId) {
    return model;
  }

  if (isTerminal(currentNode) && !isStart(currentNode)) {
    return model;
  }

  const edge = findOutEdgeByPathColor({
    model: modelWithPath,
    nodeId: currentNode.id,
    pathColor: pathColor,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      start: currentNode.id,
      target: targetNodeId,
    });

    const updated = shortestPath.reduce(
      (acc, edgeId) => setEdgePathColor(acc, edgeId, pathColor),
      model
    );

    return updated;
  }

  if (hasPathColor(model, edge.to)) {
    return model;
  }

  const edgeId = toEdgeId({ from: currentNode.id, to: edge.to });

  const updated = setEdgePathColor(model, edgeId, pathColor);

  return extendPathWalk({
    modelWithPath,
    pathColor,
    targetNodeId,
    currentNode: edge.nodeTo,
    model: updated,
  });
};

type BreadthFirstTree = {
  [id: NodeId]: {
    parent?: NodeId;
  };
};

const findShortestEmptyPath = ({
  model,
  start,
  target,
}: {
  model: Model;
  start: NodeId;
  target: NodeId;
}): EdgeId[] => {
  //
  // Construct the breadth first tree from target to start
  //

  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: BreadthFirstTree = { [start]: {} };

  visited.add(start);
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    visited.add(current);

    if (current === target) {
      break;
    }

    for (const outEdge of yieldOutEdges(model, current)) {
      const adjacent = outEdge.nodeTo;

      if (visited.has(adjacent.id)) {
        continue;
      }

      if (hasPathColor(model, adjacent.id)) {
        continue;
      }

      if (
        isTerminal(adjacent) &&
        adjacent.color !== toPathColor(model, start)
      ) {
        continue;
      }

      queue.push(adjacent.id);
      tree[adjacent.id] = { parent: current };
    }
  }

  //
  // Construct the path from the breadth first tree
  //

  let current = target;
  const nodePath: NodeId[] = [current];

  while (current !== start) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  //
  // Convert node path to edge path
  //

  const path: EdgeId[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i];
    if (!from) {
      continue;
    }
    const to = nodePath[i + 1];
    if (!to) {
      continue;
    }
    path.push(toEdgeId({ from, to }));
  }

  console.log(path);

  // const edgeId = toEdgeId({ from: start, to: target });
  // if (doesEdgeExist(model, edgeId)) {
  //   return [edgeId];
  // }

  return path;
};

const doesEdgeExist = (model: Model, edgeId: EdgeId): boolean => {
  return edgeId in model.edges;
};

export const hasPathColor = (model: Model, nodeId: NodeId): boolean => {
  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.pathColor) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.pathColor) {
      return true;
    }
  }

  return false;
};

const findOutEdgeByPathColor = <T extends Model>({
  model,
  nodeId,
  pathColor,
}: {
  model: T;
  nodeId: NodeId;
  pathColor: Color;
}): EdgeFull | null => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathColor === pathColor) {
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
    if (outEdge.pathColor !== color) {
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
    if (edge.pathColor) {
      return edge.pathColor;
    }
  }

  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.pathColor) {
      return edge.pathColor;
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
