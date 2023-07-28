import { takeWhile } from "@gamezilla/core";
import {
  GroupId,
  Model,
  Node,
  NodeId,
  StartNode,
  setNode,
  yieldNodes,
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
  const path = findPath(model, groupId);

  if (path.length === 0) {
    return model;
  }

  const subPath = takeWhile((nodeId) => nodeId !== newNodeId, path);

  const added = setPath(model, groupId, subPath);

  return added;
};

/**
 * Returns ordered list of node from a group
 */
const findPath = (
  model: Model,
  groupId: GroupId,
  currentId?: NodeId
): NodeId[] => {
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
    return [currentId];
  }

  if (!current.nextId) {
    return [currentId];
  }

  return findPath(model, groupId, current.nextId);
};

export const removePath = (model: Model, groupId: GroupId): Model => {
  let modelNew: Model = { ...model };
  for (const node of yieldNodes(model)) {
    if (node.t === "empty") {
      continue;
    }
    if (node.groupId !== groupId) {
      continue;
    }

    const nodeNew: Node =
      node.t === "start"
        ? {
            nodeId: node.nodeId,
            groupId: node.groupId,
            t: "start",
          }
        : node.t === "end"
        ? {
            nodeId: node.nodeId,
            t: "end",
            groupId: node.groupId,
          }
        : {
            nodeId: node.nodeId,
            t: "empty",
          };

    modelNew = setNode(modelNew, nodeNew);
  }
  return modelNew;
};

const setPath = <T extends Model>(
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

  const modelNew = setNode(model, head);

  return setPath(modelNew, groupId, tail);
};

const findStartNode = (model: Model, groupId: GroupId): StartNode | null => {
  for (const node of yieldNodes(model)) {
    if (node.t === "start" && node.groupId === groupId) {
      return node;
    }
  }
  return null;
};
