import * as Flow from "../flow";

/**
 * Starts
 */
export const startExtendPath = ({
  model,
  groupId,
  nodeId,
}: {
  model: Flow.Model;
  groupId: Flow.GroupId;
  nodeId: Flow.NodeId;
}): Flow.Model => {
  return model;
};

/**
 * Extends the path from the start node to the target node.
 */
export const extendPath = ({
  model,
  groupId,
  newId,
}: {
  model: Flow.Model;
  groupId: Flow.GroupId;
  newId: Flow.NodeId;
}): Flow.Model => {
  const terminal = model.terminalsByGroupId[groupId];

  if (!terminal) {
    return model;
  }

  const path = toNodePath(model, groupId);

  const subPath = takeWhile(path, (nodeId) => nodeId !== newId);

  const pathNew = [...subPath, newId];

  const modelNew = addPath(removePath(model, groupId), groupId, pathNew);

  return modelNew;
};

/**
 * Returns ordered list of node from a group starting from a `start` mode.
 */
const toNodePath = (
  model: Flow.Model,
  groupId: Flow.GroupId
): Flow.NodeId[] => {
  const terminal = model.terminalsByGroupId[groupId];

  if (!terminal) {
    return [];
  }

  return findPathWalk(model, groupId, terminal.startId);
};

const findPathWalk = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  currentId: Flow.NodeId
): Flow.NodeId[] => {
  return [];
};

/**
 *
 */
export const removePath = (
  model: Flow.Model,
  groupId: Flow.GroupId
): Flow.Model => {
  let modelNew: Flow.Model = { ...model, pipesByTargetId: {} };

  for (const pipe of Flow.yieldPipes(model)) {
    if (pipe.groupId === groupId) {
      continue;
    }

    modelNew = {
      ...modelNew,
      pipesByTargetId: {
        ...modelNew.pipesByTargetId,
        [pipe.edge.targetId]: pipe,
      },
    };
  }
  return modelNew;
};

/**
 *
 */
const addPath = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  path: Flow.NodeId[]
): Flow.Model => {
  const terminal = model.terminalsByGroupId[groupId];

  if (!terminal) {
    return model;
  }

  const [headId, ...tail] = path;

  if (!headId) {
    return model;
  }

  const modelNew: Flow.Model = {
    ...model,
    pipesByTargetId: {
      ...model.pipesByTargetId,
      [headId]: {
        groupId,
        targetId: headId,
        sourceId: terminal.startId,
      },
    },
  };

  return addPathWalk(modelNew, groupId, headId, tail);
};

const addPathWalk = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  prevId: Flow.NodeId,
  path: Flow.NodeId[]
): Flow.Model => {
  const [headId, ...tail] = path;

  if (!headId) {
    return model;
  }

  const head = model.nodes[headId];

  if (!head) {
    return model;
  }

  return model;
};

const takeWhile = <T>(
  arr: Iterable<T>,
  predicate: (item: T) => boolean
): T[] => {
  const results: T[] = [];
  for (const item of arr) {
    if (!predicate(item)) {
      break;
    }
    results.push(item);
  }
  return results;
};
