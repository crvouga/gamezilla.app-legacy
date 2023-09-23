import { takeWhile } from "gamezilla/@SHARED/core";
// import { findShortestEmptyPath } from "./algo-find-shortest-path";
import {
  Node,
  GroupId,
  Model,
  NodeId,
  StartNode,
  addNode,
  yieldNodes,
} from "./flow";

/**
 * Extends the path from the start node to the target node.
 */
export const extendPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  newId: NodeId
): T => {
  const path = findPath(model, groupId);

  const subPath = takeWhile((node) => node.nodeId !== newId, path);

  const added = setPath(
    model,
    groupId,
    subPath.map((x) => x.nodeId)
  );

  // const end = subPath[subPath.length - 1];

  // const shortestPath = end ? findShortestEmptyPath(added, end.nodeId, newId) : [];

  // const pathNew = [...subPath, ...shortestPath];

  // const addedNew = setPath(model, groupId, pathNew);

  return added;
};

/**
 * Returns ordered list of node from a group
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

  return [current, ...findPath(model, groupId, current.nextId)];
};

/**
 *
 */
export const setPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  path: NodeId[]
): T => {
  return addPath(removePath(model, groupId), groupId, path);
};

/**
 *
 */
export const removePath = <T extends Model>(model: T, groupId: GroupId): T => {
  let modelNew: T = { ...model };
  for (const node of yieldNodes(model)) {
    if (node.t === "path" && node.groupId === groupId) {
      modelNew = addNode(modelNew, {
        nodeId: node.nodeId,
        t: "empty",
      });
    }
  }
  return modelNew;
};

/**
 *
 */
const addPath = <T extends Model>(
  model: T,
  groupId: GroupId,
  path: NodeId[]
): T => {
  const [headId, ...tail] = path;

  if (!headId) {
    return model;
  }

  const head = model.nodes[headId];

  if (!head) {
    return model;
  }

  const modelNew = addNode(model, head);

  return addPath(modelNew, groupId, tail);
};

const findStartNode = (model: Model, groupId: GroupId): StartNode | null => {
  for (const node of yieldNodes(model)) {
    if (node.t === "start" && node.groupId === groupId) {
      return node;
    }
  }
  return null;
};
