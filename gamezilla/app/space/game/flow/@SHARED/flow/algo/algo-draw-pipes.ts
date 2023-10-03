import { p } from "gamezilla/@SHARED/core";
import * as Flow from "../flow";
import { takeWhile } from "./utils";

/**
 * A `Pipeline` represents the sequence of nodes the user draws when connecting terminals.
 */
type Pipeline = Flow.NodeId[];

/**
 * Starts
 */
export const startDrawPipes = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  newNodeId: Flow.NodeId
): Flow.Model => {
  const terminal = Flow.toTerminalByGroupId(model, groupId);

  if (!terminal) {
    return model;
  }

  if (terminal.endId === newNodeId) {
    const reversed = Flow.flipTerminal(model, terminal);

    const drew = drawPipes(reversed, groupId, newNodeId);

    return drew;
  }

  const drew = drawPipes(model, groupId, newNodeId);

  return drew;
};

/**
 * Algorithm that draws pipes from the inputted group id to the inputted node id
 */
export const drawPipes = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  newNodeId: Flow.NodeId
): Flow.Model => {
  const newNodeGroupId = Flow.findGroupIdByNodeId(model, newNodeId);

  // Prevent drawing over other groups
  if (newNodeGroupId && newNodeGroupId !== groupId) {
    return model;
  }

  const terminal = Flow.toTerminalByGroupId(model, groupId);

  if (!terminal) {
    return model;
  }

  // For UX, prevent drawing from overshooting after terminals is connected
  if (!newNodeGroupId && isTerminalConnected(model, terminal)) {
    return model;
  }

  const existingPipeline = findPipeline(
    model,
    terminal.groupId,
    terminal.startId
  );

  const pipelineNew = p(
    existingPipeline,

    // Cutting off pipeline if user draws over existing pipeline
    (pipeline) =>
      takeWhile(
        pipeline,
        (nodeId) => nodeId !== newNodeId && nodeId !== terminal.endId
      ),

    (pipeline) => [...pipeline, newNodeId],

    (pipeline) => takeWhileConnected(model, pipeline),

    (pipeline) => {
      const startNodeId = pipeline[pipeline.length - 1];

      if (!startNodeId) {
        return pipeline;
      }

      const shortest = findShortestEmptyPipeline(model, startNodeId, newNodeId);

      const pipelineNew = [...pipeline, ...shortest.slice(1)];

      return pipelineNew;
    }
  );

  const added = addPipeline(
    removePipeline(model, groupId),
    terminal,
    pipelineNew
  );

  return added;
};

/**
 * Takes nodes in order from the inputted pipeline until a node are no longer connected to the previous node
 */
const takeWhileConnected = (
  model: Flow.Model,
  pipeline: Pipeline
): Pipeline => {
  const result: Pipeline = [];
  for (let i = 0; i < pipeline.length; i++) {
    const currNode = pipeline[i];

    if (!currNode) {
      continue;
    }

    const prevNode = result[result.length - 1];

    if (!prevNode) {
      result.push(currNode);
      continue;
    }

    if (Flow.hasEdge(model, prevNode, currNode)) {
      result.push(currNode);
      continue;
    }

    break;
  }
  return result;
};

/**
 *
 */
const isTerminalConnected = (
  model: Flow.Model,
  terminal: Flow.Terminal,
  currentId: Flow.NodeId = terminal.startId
): boolean => {
  if (currentId === terminal.endId) {
    return true;
  }

  const pipe = Flow.toPipeBySourceId(model, currentId);

  if (!pipe) {
    return false;
  }

  if (pipe.groupId !== terminal.groupId) {
    return false;
  }

  return isTerminalConnected(model, terminal, pipe.edge.targetId);
};

/**
 * Returns a pipeline for inputted group id starting from inputted node id
 */
const findPipeline = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  currentId: Flow.NodeId
): Pipeline => {
  const pipe = Flow.toPipeBySourceId(model, currentId);

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
 * Removes all pipes that are part of the pipeline with the inputted group id
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
      groupId: pipe.groupId,
    };
  }

  return {
    ...model,
    pipesBySourceId,
  };
};

/**
 * Adds all pipes that are part of the pipeline with the inputted group id
 */
const addPipeline = (
  model: Flow.Model,
  terminal: Flow.Terminal,
  pipeline: Pipeline
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

/**
 * Returns a list of nodes without a groupId that form the shortest path between the source and target nodes.
 */
export const findShortestEmptyPipeline = (
  model: Flow.Model,
  sourceId: Flow.NodeId,
  targetId: Flow.NodeId
): Flow.NodeId[] => {
  const sourceGroupId = Flow.findGroupIdByNodeId(model, sourceId);

  if (!sourceGroupId) {
    return [];
  }

  const terminal = Flow.toTerminalByGroupId(model, sourceGroupId);

  //
  //
  //  Construct the breadth first tree
  //
  //

  const queue: Flow.NodeId[] = [];
  const visited = new Set<Flow.NodeId>();
  const tree: { [id: Flow.NodeId]: { parent?: Flow.NodeId } } = {};

  visited.add(sourceId);
  queue.push(sourceId);

  while (true) {
    const currentId = queue.shift();

    if (!currentId) {
      break;
    }

    visited.add(currentId);

    if (currentId === targetId) {
      break;
    }

    if (currentId === terminal?.endId) {
      break;
    }

    for (const outEdge of Flow.yieldEdgesOut(model, currentId)) {
      const adjacentId = outEdge.targetId;

      if (visited.has(adjacentId)) {
        continue;
      }

      const adjacentPipe = Flow.findPipeByNodeId(model, adjacentId);

      if (adjacentPipe) {
        continue;
      }

      const adjacentTerminal = Flow.findTerminalByNodeId(model, adjacentId);

      if (adjacentTerminal && adjacentTerminal.groupId !== sourceGroupId) {
        continue;
      }

      queue.push(adjacentId);
      tree[adjacentId] = { parent: currentId };
    }
  }

  // Construct the path from the breadth first tree

  let current = targetId;
  const nodePath: Flow.NodeId[] = [current];

  while (current !== sourceId) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  // Convert node path to edge path

  const path: Flow.EdgeId[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i];
    if (!from) {
      continue;
    }
    const to = nodePath[i + 1];
    if (!to) {
      continue;
    }
    path.push(Flow.toEdgeId({ sourceId: from, targetId: to }));
  }

  // Done

  return nodePath;
};
