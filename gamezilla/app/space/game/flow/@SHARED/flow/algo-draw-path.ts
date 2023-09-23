import { findShortestEmptyPath } from "./algo-find-shortest-path";
import {
  Edge,
  Model,
  NodeId,
  GroupId,
  findGroup,
  findTerminal,
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
  const terminal = findTerminal(model, nodeId);

  if (terminal) {
    return setStartNode(destroyPath(model, terminal.groupId), terminal, nodeId);
  }

  const groupId = findGroup(model, nodeId);

  if (!groupId) {
    return model;
  }

  return extendPath(model, groupId, nodeId);
};

/**
 * Extends the path from the start node to the target node.
 */
export const extendPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  newNodeId: NodeId
): T => {
  const newNodeGroupId = findGroup(model, newNodeId);
  const isNewNodeInDifferentPath = newNodeGroupId && newNodeGroupId !== groupId;
  if (isNewNodeInDifferentPath) {
    return model;
  }

  const terminal = model.terminals[groupId];

  // Can not extend a path that does not have a start node.
  if (!terminal) {
    return model;
  }

  const walked = extendPathWalk({
    newNodeId,
    groupId,
    modelNew: destroyPath(model, groupId),
    modelWithPath: model,
    currentNodeId: terminal.startId,
  });

  return walked;
};

const extendPathWalk = <T extends Model>({
  newNodeId,
  currentNodeId,
  groupId,
  modelWithPath,
  modelNew,
}: {
  newNodeId: NodeId;
  groupId: GroupId;
  modelWithPath: T;
  modelNew: T;
  currentNodeId: NodeId;
}): T => {
  // Can not extend a path with a node that is already in the path.
  if (currentNodeId === newNodeId) {
    return modelNew;
  }

  const terminal = findTerminal(modelWithPath, currentNodeId);

  // Done walking the path. We made it to the end.
  if (terminal && terminal.endId === currentNodeId) {
    const edgeId = toEdgeId({ source: currentNodeId, target: terminal.endId });
    return setEdgePath(modelNew, edgeId, groupId);
  }

  const edge = findOutEdgeWithGroupId({
    model: modelWithPath,
    sourceNodeId: currentNodeId,
    groupId: groupId,
  });

  if (!edge) {
    const shortestPath = findShortestEmptyPath({
      model: modelWithPath,
      source: currentNodeId,
      target: newNodeId,
    });

    const added = shortestPath.reduce(
      (acc, edgeId) => setEdgePath(acc, edgeId, groupId),
      modelNew
    );
    return added;
  }

  if (isNodeAssociatedWithPath(modelNew, edge.target)) {
    return modelNew;
  }

  const edgeId = toEdgeId({ source: currentNodeId, target: edge.target });

  const updated = setEdgePath(modelNew, edgeId, groupId);

  return extendPathWalk({
    modelWithPath,
    groupId: groupId,
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
    if (edge.groupId) {
      return true;
    }
  }

  for (const edge of yieldInEdges(model, nodeId)) {
    if (edge.groupId) {
      return true;
    }
  }

  return false;
};

/**
 * Dissociates inputted path from all edges.
 */
const destroyPath = <T extends Model>(model: T, groupId: GroupId): T => {
  let modelNew: T = { ...model };
  for (const edge of yieldEdges(model)) {
    if (edge.groupId !== groupId) {
      continue;
    }
    modelNew = setEdgePath(modelNew, toEdgeId(edge), null);
  }
  return modelNew;
};

/**
 * Find an edge where the inputted node is the source and the path id matches.
 */
const findOutEdgeWithGroupId = <T extends Model>({
  model,
  sourceNodeId,
  groupId,
}: {
  model: T;
  sourceNodeId: NodeId;
  groupId: GroupId;
}): Edge | null => {
  for (const outEdge of yieldOutEdges(model, sourceNodeId)) {
    if (outEdge.groupId === groupId) {
      return outEdge;
    }
  }
  return null;
};
