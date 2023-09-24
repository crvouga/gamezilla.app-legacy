import * as Flow from "../flow";

/**
 * Starts
 */
export const startPipeline = ({
  model,
  groupId,
  nodeId,
}: {
  model: Flow.Model;
  groupId: Flow.GroupId;
  nodeId: Flow.NodeId;
}): Flow.Model => {
  const terminal = model.terminalsByGroupId[groupId];

  if (!terminal) {
    return model;
  }

  if (terminal.startId === nodeId) {
    const removed = removePipeline(model, groupId);

    return removed;
  }

  if (terminal.endId === nodeId) {
    const reversed = reverseTerminal(model, groupId);

    return reversed;
  }

  return model;
};

const reverseTerminal = (
  model: Flow.Model,
  groupId: Flow.GroupId
): Flow.Model => {
  const terminal = model.terminalsByGroupId[groupId];

  if (!terminal) {
    return model;
  }

  return {
    ...model,
    terminalsByGroupId: {
      ...model.terminalsByGroupId,
      [groupId]: {
        ...terminal,
        startId: terminal.endId,
        endId: terminal.startId,
      },
    },
  };
};

/**
 * Extends existing pipeline with the new node inputted
 */
export const extendPipeline = ({
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

  const pipeline = findPipeline(model, terminal);

  const pipelineSubset = takeWhile(pipeline, (nodeId) => nodeId !== newId);

  const pipelineNew = [...pipelineSubset, newId];

  const removed = removePipeline(model, groupId);

  const added = addPipeline(removed, terminal, pipelineNew);

  return added;
};

/**
 * Returns ordered list of node from a group starting from a `start` mode.
 */
const findPipeline = (
  model: Flow.Model,
  terminal: Flow.Terminal
): Flow.NodeId[] => {
  const pipeline = findPipelineWalk(model, terminal.groupId, terminal.startId);
  return [terminal.startId, ...pipeline];
};

const findPipelineWalk = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  currentId: Flow.NodeId
): Flow.NodeId[] => {
  const pipe = Flow.findPipeBySourceId(model, currentId);

  if (!pipe) {
    return [];
  }

  if (pipe.groupId !== groupId) {
    return [];
  }

  const pipeline = findPipelineWalk(model, groupId, pipe.edge.targetId);

  return [currentId, ...pipeline];
};

/**
 *
 */
export const removePipeline = (
  model: Flow.Model,
  groupId: Flow.GroupId
): Flow.Model => {
  let modelNew: Flow.Model = {
    ...model,
    pipesByTargetId: {},
  };

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

const addPipeline = (
  model: Flow.Model,
  terminal: Flow.Terminal,
  pipeline: Flow.NodeId[]
): Flow.Model => {
  const [headId, ...tail] = pipeline;

  if (!headId) {
    return model;
  }

  const edge: Flow.Edge = {
    sourceId: terminal.startId,
    targetId: headId,
  };

  const added = addPipe(model, terminal.groupId, edge);

  if (!added) {
    return model;
  }

  return addPipelineWalk(added, terminal.groupId, edge.targetId, tail);
};

const addPipelineWalk = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  currentId: Flow.NodeId,
  pipeline: Flow.NodeId[]
): Flow.Model => {
  const [headId, ...tail] = pipeline;

  if (!headId) {
    return model;
  }

  return model;
};

const addPipe = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  edge: Flow.Edge
): Flow.Model | null => {
  if (!Flow.hasEdge(model, edge)) {
    return null;
  }

  const pipeNew: Flow.Pipe = {
    edgeId: Flow.toEdgeId(edge),
    groupId: groupId,
  };

  const modelNew: Flow.Model = {
    ...model,
    pipesByTargetId: {
      ...model.pipesByTargetId,
      [edge.targetId]: pipeNew,
    },
  };

  return modelNew;
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
