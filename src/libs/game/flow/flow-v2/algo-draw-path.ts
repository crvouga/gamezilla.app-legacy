import {
  Edge,
  GroupId,
  Model,
  Node,
  NodeId,
  StartNode,
  mapNodes,
  toEdgeId,
  yieldEdges,
  yieldInEdges,
  yieldNodes,
  yieldOutEdges,
} from "./flow";

/**
 * The first function called when a user starts drawing a path.
 */
export const startPath = <T extends Model>(model: T): T => {
  return model;
};

/**
 * Extends the path from the start node to the target node.
 */
export const extendPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  newNodeId: NodeId
): T => {
  const newNode = model.nodes[newNodeId];

  if (!newNode) {
    return model;
  }

  if (newNode.t !== "empty") {
    return model;
  }

  const path = takeUntil(
    findPath(model, groupId),
    (node) => node.nodeId === newNodeId
  );

  if (path.length === 0) {
    return model;
  }

  const removed = removePath({
    model,
    groupId,
    currentId: last.nodeId,
  });

  const shortestEmptyPath = findShortestEmptyPath({
    model: removed,
    sourceId: last.nodeId,
    targetId: newNodeId,
  });

  if (!shortestEmptyPath) {
    return removed;
  }

  return removed;
};

const takeUntil = <T>(arr: T[], predicate: (item: T) => boolean): T[] => {
  const result: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      return result;
    }
    result.push(item);
  }
  return result;
};

/**
 * Returns last node of the walk
 */
const findPath = (
  model: Model,
  groupId: GroupId,
  currentId?: NodeId
): Node[] => {
  if (!currentId) {
    const startNode = findStartNode(model, groupId);
    if (!startNode) {
      return [];
    }
    return findPath(model, groupId, startNode.nodeId);
  }

  const current = model.nodes[currentId];

  if (!current) {
    return [];
  }

  if (current.t === "empty") {
    return [];
  }

  if (current.groupId !== groupId) {
    return [];
  }

  if (current.t === "end") {
    return [current];
  }

  if (!current.nextId) {
    return [current];
  }

  return findPath(model, groupId, current.nextId);
};

const removePath = ({
  model,
  groupId,
  currentId,
}: {
  model: Model;
  groupId: GroupId;
  currentId: NodeId;
}): Model => {
  const current = model.nodes[currentId];

  if (!current) {
    return model;
  }

  if (current.t === "empty") {
    return model;
  }

  if (current.groupId !== groupId) {
    return model;
  }

  if (current.t === "end") {
    return model;
  }

  if (!current.nextId) {
    return model;
  }

  const removed = dissocNodeFromGroup(model, current.nodeId);

  return removePath({
    model: removed,
    groupId,
    currentId: current.nextId,
  });
};

const assocNodeWithGroup = (model: Model, nodeId: NodeId, groupId: GroupId) => {
  return mapNodes(model, (node) => {
    if (node.nodeId !== nodeId) {
      return node;
    }

    return {
      nodeId: node.nodeId,
      t: "path",
      groupId,
      prevId: node.nodeId,
    };
  });
};

const dissocNodeFromGroup = (model: Model, nodeId: NodeId): Model => {
  return mapNodes(model, (node) => {
    if (node.nodeId !== nodeId) {
      return node;
    }

    return {
      nodeId: node.nodeId,
      t: "empty",
    };
  });
};

const findStartNode = (model: Model, groupId: GroupId): StartNode | null => {
  for (const node of yieldNodes(model)) {
    if (node.t === "start" && node.groupId === groupId) {
      return node;
    }
  }
  return null;
};

const findLastNode = (model: Model, groupId: GroupId): NodeId | null => {
  return null;
};

const extendPathWalk = <T extends Model>({
  newNodeId,
  currentId,
  groupId,
  modelWithPath,
  modelNew,
}: {
  newNodeId: NodeId;
  groupId: GroupId;
  modelWithPath: T;
  modelNew: T;
  currentId: NodeId;
}): T => {
  retr;
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
