import {
  Edge,
  EdgeFull,
  EdgeId,
  PathId,
  Model,
  NodeId,
  Terminal,
  nodeToTerminal,
  setEdgePath,
  toEdgeId,
  nodeToPath,
  toNode,
  toStartNodeId,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
} from "./flow";

export const startPath = <T extends Model>(model: T, nodeId: NodeId): T => {
  const terminal = nodeToTerminal(model, nodeId);

  if (!terminal) {
    return model;
  }

  const cleared = clearPathFromEdges(model, terminal.pathId);

  const terminalNew: Terminal = {
    ...terminal,
    pair:
      terminal.pair[0] === nodeId
        ? [terminal.pair[1], nodeId]
        : [nodeId, terminal.pair[0]],
  };

  return {
    ...cleared,
    terminals: {
      ...cleared.terminals,
      [terminalNew.pathId]: terminalNew,
    },
  };
};

const clearPathFromEdges = <T extends Model>(model: T, pathId: PathId): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.pathId === pathId) {
      modelNew = setEdgePath(modelNew, toEdgeId(edge), null);
    }
  }
  return modelNew;
};

/**
 *
 *
 * Extends the path from the start node to the target node.
 *
 *
 */
export const extendPath = <T extends Model>(
  model: T,
  pathId: PathId,
  targetNodeId: NodeId
): T => {
  const targetNode = toNode(model, targetNodeId);

  if (!targetNode) {
    return model;
  }

  const targetNodepathId = nodeToPath(model, targetNodeId);

  if (targetNodepathId && targetNodepathId !== pathId) {
    return model;
  }

  const startNode = toStartNodeId(model, pathId);

  if (!startNode) {
    return model;
  }

  const modelWithoutPath = clearPathFromEdges(model, pathId);

  const walked = extendPathWalk({
    targetNodeId,
    pathId,
    modelWithPath: model,
    model: modelWithoutPath,
    currentNodeId: startNode,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  targetNodeId,
  pathId,
  modelWithPath,
  model,
  currentNodeId,
}: {
  targetNodeId: NodeId;
  pathId: PathId;
  modelWithPath: T;
  model: T;
  currentNodeId: NodeId;
}): T => {
  if (currentNodeId === targetNodeId) {
    return model;
  }

  const terminal = nodeToTerminal(modelWithPath, currentNodeId);

  if (terminal?.pair[1] === currentNodeId) {
    return model;
  }

  const edge = findOutEdgeBypathId({
    model: modelWithPath,
    nodeId: currentNodeId,
    pathId: pathId,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      start: currentNodeId,
      target: targetNodeId,
    });

    const updated = shortestPath.reduce(
      (acc, edgeId) => setEdgePath(acc, edgeId, pathId),
      model
    );

    return updated;
  }

  if (isInGroup(model, edge.to)) {
    return model;
  }

  const edgeId = toEdgeId({ from: currentNodeId, to: edge.to });

  const updated = setEdgePath(model, edgeId, pathId);

  return extendPathWalk({
    modelWithPath,
    pathId: pathId,
    targetNodeId,
    currentNodeId: edge.to,
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
      const adjacentId = outEdge.to;

      if (visited.has(adjacentId)) {
        continue;
      }

      if (isInGroup(model, adjacentId)) {
        continue;
      }

      const terminal = nodeToTerminal(model, adjacentId);

      if (terminal && terminal.pathId === nodeToPath(model, start)) {
        continue;
      }

      queue.push(adjacentId);
      tree[adjacentId] = { parent: current };
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

export const isInGroup = (model: Model, nodeId: NodeId): boolean => {
  for (const edge of yieldOutEdges(model, nodeId)) {
    if (edge.pathId) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.pathId) {
      return true;
    }
  }

  return false;
};

const findOutEdgeBypathId = <T extends Model>({
  model,
  nodeId,
  pathId,
}: {
  model: T;
  nodeId: NodeId;
  pathId: PathId;
}): EdgeFull | null => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathId === pathId) {
      return outEdge;
    }
  }
  return null;
};

export const findPathEndNode = (
  model: Model,
  pathId: PathId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathId !== pathId) {
      continue;
    }

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, pathId, outEdge.to);
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
  pathId: PathId
): Edge | null => {
  const startId = toStartNodeId(model, pathId);

  if (!startId) {
    return null;
  }

  const endId = findPathEndNode(model, pathId, startId);

  if (!endId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, endId)) {
    const terminal = nodeToTerminal(model, edge.to);
    if (terminal && terminal.pathId === pathId) {
      return edge;
    }
  }

  return null;
};
