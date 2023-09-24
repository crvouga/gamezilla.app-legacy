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
  const terminal = Flow.findTerminalByGroupId(model, groupId);

  if (!terminal) {
    return model;
  }

  if (terminal.startId === nodeId) {
    const removed = removePipeline(model, groupId);

    return removed;
  }

  if (terminal.endId === nodeId) {
    const reversed = Flow.flipTerminal(model, terminal);

    return reversed;
  }

  return model;
};

/**
 * Extends existing pipeline with the new node inputted
 */
export const extendPipeline = ({
  model,
  groupId,
  newNodeId,
}: {
  model: Flow.Model;
  groupId: Flow.GroupId;
  newNodeId: Flow.NodeId;
}): Flow.Model => {
  const terminal = Flow.findTerminalByGroupId(model, groupId);

  if (!terminal) {
    return model;
  }

  const newNodeGroupId = Flow.findGroupIdByNodeId(model, newNodeId);

  if (newNodeGroupId && newNodeGroupId !== groupId) {
    return model;
  }

  const pipeline = findPipeline(model, terminal.groupId, terminal.startId);

  const pipelineNew = takeWhileInclusive(
    [...pipeline, newNodeId],
    (nodeId) => nodeId !== newNodeId && nodeId !== terminal.endId
  );

  const added = addPipeline(
    removePipeline(model, groupId),
    terminal,
    pipelineNew
  );

  return added;
};

/**
 * Returns an ordered list of nodes that are part of the pipeline
 * starting from the start node of the inputted group
 */
const findPipeline = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  currentId: Flow.NodeId
): Flow.NodeId[] => {
  const pipe = Flow.findPipeBySourceId(model, currentId);

  if (!pipe) {
    return [currentId];
  }

  if (pipe.groupId !== groupId) {
    return [];
  }

  const pipeline = findPipeline(model, groupId, pipe.edge.targetId);

  return [currentId, ...pipeline];
};

/**
 *
 */
export const removePipeline = (
  model: Flow.Model,
  groupId: Flow.GroupId
): Flow.Model => {
  const pipesBySourceId: Flow.Model["pipesBySourceId"] = {};

  for (const pipe of Flow.yieldPipes(model)) {
    if (pipe.groupId === groupId) {
      continue;
    }
    pipesBySourceId[pipe.edge.sourceId] = {
      edgeId: pipe.edgeId,
      groupId,
    };
  }

  return {
    ...model,
    pipesBySourceId,
  };
};

const addPipeline = (
  model: Flow.Model,
  terminal: Flow.Terminal,
  pipeline: Flow.NodeId[]
): Flow.Model => {
  const first = pipeline[0];

  if (!first) {
    return model;
  }

  const second = pipeline[1];

  if (!second) {
    return model;
  }

  const edge: Flow.Edge = {
    sourceId: first,
    targetId: second,
  };

  const pipeNew: Flow.Pipe = {
    edgeId: Flow.toEdgeId(edge),
    groupId: terminal.groupId,
  };

  const added = Flow.addPipe(model, pipeNew);

  if (!added) {
    return model;
  }

  const tail = pipeline.slice(1);

  return addPipeline(added, terminal, tail);
};

const takeWhileInclusive = <T>(
  arr: Iterable<T>,
  predicate: (item: T) => boolean
): T[] => {
  const results: T[] = [];
  for (const item of arr) {
    results.push(item);

    if (!predicate(item)) {
      break;
    }
  }
  return results;
};
