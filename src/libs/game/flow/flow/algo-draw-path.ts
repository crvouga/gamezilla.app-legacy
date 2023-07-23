import { findShortestEmptyPath } from "./algo-find-shortest-path";
import {
  Edge,
  EdgeFull,
  Model,
  NodeId,
  PathId,
  Terminal,
  nodeToPath,
  nodeToTerminal,
  setEdgePath,
  toEdgeId,
  toNode,
  toStartNodeId,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
} from "./flow";

/**
 * The first function called when a user starts drawing a path.
 */
export const startPath = <T extends Model>(model: T, nodeId: NodeId): T => {
  const terminal = nodeToTerminal(model, nodeId);

  if (!terminal) {
    const pathId = nodeToPath(model, nodeId);

    if (!pathId) {
      return model;
    }

    return extendPath(model, pathId, nodeId);
  }

  const cleared = destroyPath(model, terminal.pathId);

  const terminalNew: Terminal =
    terminal.start === nodeId
      ? {
          ...terminal,
          start: terminal.end,
          end: nodeId,
        }
      : {
          ...terminal,
          start: nodeId,
          end: terminal.end,
        };

  return {
    ...cleared,
    terminals: {
      ...cleared.terminals,
      [terminalNew.pathId]: terminalNew,
    },
  };
};

/**
 * Remove path when the user stops drawing a path.
 */
const destroyPath = <T extends Model>(model: T, pathId: PathId): T => {
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
  newNodeId: NodeId
): T => {
  const newNode = toNode(model, newNodeId);

  /**
   * Can't extend path to a node that doesn't exist.
   */
  if (!newNode) {
    return model;
  }

  const newNodePathId = nodeToPath(model, newNodeId);

  if (newNodePathId && newNodePathId !== pathId) {
    return model;
  }

  const startNode = toStartNodeId(model, pathId);

  if (!startNode) {
    return model;
  }

  const modelWithoutPath = destroyPath(model, pathId);

  const walked = extendPathWalk({
    targetNodeId: newNodeId,
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

  if (terminal?.end === currentNodeId) {
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

  if (isNodeInPath(model, edge.to)) {
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

export const isNodeInPath = (model: Model, nodeId: NodeId): boolean => {
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
