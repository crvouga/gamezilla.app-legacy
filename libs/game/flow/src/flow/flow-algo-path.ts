import {
  Edge,
  EdgeFull,
  EdgeId,
  Model,
  Node,
  NodeId,
  TerminalNode,
  isStart,
  isTerminal,
  setEdgePathColor,
  setNode,
  toEdgeId,
  toNode,
  toPathColor,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
  yieldTerminalNodes,
} from './flow';
import { Color } from './flow-color';

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
  //
  // Construct the breadth first tree
  //
  //
  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: { [id: NodeId]: { parent?: NodeId } } = {};

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

  //
  // Done
  //

  return path;
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

export const findPathEndId = (
  model: Model,
  pathColor: Color,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathColor !== pathColor) {
      continue;
    }

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findPathEndId(model, pathColor, outEdge.to);
  }

  return nodeId;
};

//
//
//
// Autocomplete path
//
//
//

export const toAutocompleteEdge = (
  model: Model,
  pathColor: Color
): Edge | null => {
  const pathStart = findPathStart(model, pathColor);

  if (!pathStart) {
    return null;
  }

  const pathEndId = findPathEndId(model, pathColor, pathStart.id);

  if (!pathEndId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, pathEndId)) {
    if (isTerminal(edge.nodeTo) && edge.nodeTo.color === pathColor) {
      return edge;
    }
  }

  return null;
};
