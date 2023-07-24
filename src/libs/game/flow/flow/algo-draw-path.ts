import { findShortestEmptyPath } from "./algo-find-shortest-path";
import {
  Edge,
  Model,
  NodeId,
  PathId,
  findPath,
  findPathTerminal,
  setEdgePath,
  setStartNode,
  toEdgeId,
  yieldEdges,
  yieldInEdges,
  yieldOutEdges,
} from "./flow";

/**
 * The first function called when a user starts drawing a path.
 */
export const startPath = <T extends Model>(model: T, nodeId: NodeId): T => {
  const terminal = findPathTerminal(model, nodeId);

  if (terminal) {
    return setStartNode(destroyPath(model, terminal.pathId), terminal, nodeId);
  }

  const pathId = findPath(model, nodeId);

  if (!pathId) {
    return model;
  }

  return extendPath(model, pathId, nodeId);
};

/**
 * Extends the path from the start node to the target node.
 */
export const extendPath = <T extends Model>(
  model: T,
  pathId: PathId,
  newNodeId: NodeId
): T => {
  const newNodePathId = findPath(model, newNodeId);
  const isNewNodeInDifferentPath = newNodePathId && newNodePathId !== pathId;
  if (isNewNodeInDifferentPath) {
    return model;
  }

  const terminal = model.pathTerminals[pathId];

  // Can not extend a path that does not have a start node.
  if (!terminal) {
    return model;
  }

  const walked = extendPathWalk({
    newNodeId,
    pathId,
    modelNew: destroyPath(model, pathId),
    modelWithPath: model,
    currentNodeId: terminal.startId,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  newNodeId,
  currentNodeId,
  pathId,
  modelWithPath,
  modelNew,
}: {
  newNodeId: NodeId;
  pathId: PathId;
  modelWithPath: T;
  modelNew: T;
  currentNodeId: NodeId;
}): T => {
  // Can not extend a path with a node that is already in the path.
  if (currentNodeId === newNodeId) {
    return modelNew;
  }

  const terminal = findPathTerminal(modelWithPath, currentNodeId);

  // Done walking the path. We made it to the end.
  if (terminal && terminal.endId === currentNodeId) {
    const edgeId = toEdgeId({ source: currentNodeId, target: terminal.endId });
    return setEdgePath(modelNew, edgeId, pathId);
  }

  const edge = findOutEdgeWithPathId({
    model: modelWithPath,
    sourceNodeId: currentNodeId,
    pathId: pathId,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      source: currentNodeId,
      target: newNodeId,
    });

    const added = shortestPath.reduce(
      (acc, edgeId) => setEdgePath(acc, edgeId, pathId),
      modelNew
    );
    return added;
  }

  if (isNodeAssociatedWithPath(modelNew, edge.target)) {
    return modelNew;
  }

  const edgeId = toEdgeId({ source: currentNodeId, target: edge.target });

  const updated = setEdgePath(modelNew, edgeId, pathId);

  return extendPathWalk({
    modelWithPath,
    pathId: pathId,
    newNodeId,
    currentNodeId: edge.target,
    modelNew: updated,
  });
};

/**
 * Returns true if the inputted node is associated with a path.
 */
export const isNodeAssociatedWithPath = (
  model: Model,
  nodeId: NodeId
): boolean => {
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

/**
 * Dissociates inputted path from all edges.
 */
const destroyPath = <T extends Model>(model: T, pathId: PathId): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.pathId !== pathId) {
      continue;
    }
    modelNew = setEdgePath(modelNew, toEdgeId(edge), null);
  }
  return modelNew;
};

/**
 * Find an edge where the inputted node is the source and the path id matches.
 */
const findOutEdgeWithPathId = <T extends Model>({
  model,
  sourceNodeId,
  pathId,
}: {
  model: T;
  sourceNodeId: NodeId;
  pathId: PathId;
}): Edge | null => {
  for (const outEdge of yieldOutEdges(model, sourceNodeId)) {
    if (outEdge.pathId === pathId) {
      return outEdge;
    }
  }
  return null;
};
