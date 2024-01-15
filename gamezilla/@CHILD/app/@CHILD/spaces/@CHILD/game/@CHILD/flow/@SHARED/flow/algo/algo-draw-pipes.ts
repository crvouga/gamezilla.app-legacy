import { p } from "gamezilla/@SHARED/core";
import * as Flow from "../flow";
import { takeWhile } from "./utils";
import { MinHeap } from "gamezilla/@SHARED/data-structures/min-heap";

/**
 * A `Pipeline` represents the sequence of nodes the user draws when connecting terminals.
 */
type Pipeline = Flow.NodeId[];

/**
 * Starts
 */
export const startDrawPipes = (
  distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
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

    const drew = drawPipes(distance, reversed, groupId, newNodeId);

    return drew;
  }

  const drew = drawPipes(distance, model, groupId, newNodeId);

  return drew;
};

/**
 * Algorithm that draws pipes from the inputted group id to the inputted node id
 */
export const drawPipes = (
  distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
  model: Flow.Model,
  groupId: Flow.GroupId,
  nodeIdNew: Flow.NodeId
): Flow.Model => {
  const newNodeGroupId = Flow.findGroupIdByNodeId(model, nodeIdNew);

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
        (nodeId) => nodeId !== nodeIdNew && nodeId !== terminal.endId
      ),

    (pipeline) => [...pipeline, nodeIdNew],

    (pipeline) => takeWhileConnected(model, pipeline),

    (pipeline) => {
      const startNodeId = pipeline[pipeline.length - 1];

      if (!startNodeId) {
        return pipeline;
      }

      const shortest = findShortestEmptyPipelineAStar(
        (nodeId) => 1 - 1 / distance(nodeId, nodeIdNew),
        model,
        startNodeId,
        nodeIdNew
      );

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
  const pipelineNew: Pipeline = [];

  for (let i = 0; i < pipeline.length; i++) {
    const currNode = pipeline[i];

    if (!currNode) {
      continue;
    }

    const prevNode = pipelineNew[pipelineNew.length - 1];

    if (!prevNode) {
      pipelineNew.push(currNode);
      continue;
    }

    if (Flow.hasEdge(model, prevNode, currNode)) {
      pipelineNew.push(currNode);
      continue;
    }

    break;
  }
  return pipelineNew;
};

/**
 *
 */
const isTerminalConnected = (
  model: Flow.Model,
  terminal: Flow.Terminal
): boolean => {
  let currentId = terminal.startId;

  while (true) {
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

    currentId = pipe.edge.targetId;
  }
};

/**
 * Returns a pipeline for inputted group id starting from inputted node id
 */
const findPipeline = (
  model: Flow.Model,
  groupId: Flow.GroupId,
  initial: Flow.NodeId
): Pipeline => {
  const pipeline: Pipeline = [];
  let currentId = initial;

  while (true) {
    pipeline.push(currentId);

    const pipe = Flow.toPipeBySourceId(model, currentId);

    if (!pipe) {
      break;
    }

    if (pipe.groupId !== groupId) {
      break;
    }

    currentId = pipe.edge.targetId;
  }

  return pipeline;
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
  let modelNew: Flow.Model = { ...model };

  for (let i = 0; i < pipeline.length - 1; i++) {
    const first = pipeline[i];

    if (!first) {
      break;
    }

    const second = pipeline[i + 1];

    if (!second) {
      break;
    }

    const edge: Flow.Edge = {
      sourceId: first,
      targetId: second,
    };

    if (!Flow.hasEdge(modelNew, first, second)) {
      continue;
    }

    const pipeNew: Flow.Pipe = {
      edgeId: Flow.toEdgeId(edge),
      groupId: terminal.groupId,
    };

    modelNew.pipesBySourceId[edge.sourceId] = pipeNew;
  }

  return modelNew;
};

/**
 * Returns a list of nodes without a groupId that form the shortest path between the source and target nodes.
 */
export const findShortestEmptyPipelineBFS = (
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

//
// This might cause bugs but it's worth a try for perf
//

const gScore = new Map<Flow.NodeId, number>();
const fScore = new Map<Flow.NodeId, number>();
const cameFrom = new Map<Flow.NodeId, Flow.NodeId>();
const openSet = new MinHeap<Flow.NodeId>((a, b) => {
  const fScoreA = fScore.get(a) ?? Infinity;
  const fScoreB = fScore.get(b) ?? Infinity;
  return fScoreA - fScoreB;
});

export const findShortestEmptyPipelineAStar = (
  heuristicScore: (node: Flow.NodeId) => number,
  model: Flow.Model,
  sourceId: Flow.NodeId,
  targetId: Flow.NodeId
): Flow.NodeId[] => {
  gScore.clear();
  fScore.clear();
  cameFrom.clear();
  openSet.clear();

  const sourceGroupId = Flow.findGroupIdByNodeId(model, sourceId);

  if (!sourceGroupId) {
    return [];
  }

  gScore.set(sourceId, 0);
  fScore.set(sourceId, heuristicScore(sourceId));
  openSet.insert(sourceId);

  let iterations = 0;
  while (true) {
    iterations++;
    const current = openSet.extractMin();

    if (!current) {
      break;
    }

    if (current === targetId) {
      console.log("iterations", iterations);
      return reconstructPath(cameFrom, current);
    }

    const currentTerminal = Flow.findTerminalByNodeId(model, current);

    if (currentTerminal) {
      console.log("iterations", iterations);
      return reconstructPath(cameFrom, current);
    }

    for (const edgeOut of Flow.yieldEdgesOut(model, current)) {
      const adjacent = edgeOut.targetId;

      const adjacentPipe = Flow.findPipeByNodeId(model, adjacent);

      if (adjacentPipe) {
        continue;
      }

      const adjacentTerminal = Flow.findTerminalByNodeId(model, adjacent);

      if (adjacentTerminal && adjacentTerminal.groupId !== sourceGroupId) {
        continue;
      }

      const edgeWeight = 0;

      const tentativeGScore = (gScore.get(current) ?? Infinity) + edgeWeight;

      if (tentativeGScore < (gScore.get(adjacent) ?? Infinity)) {
        cameFrom.set(adjacent, current);
        gScore.set(adjacent, tentativeGScore);
        fScore.set(adjacent, tentativeGScore + heuristicScore(adjacent));

        if (!openSet.has(adjacent)) {
          openSet.insert(adjacent);
        }
      }
    }
  }

  return [];
};

const reconstructPath = (
  cameFrom: Map<Flow.NodeId, Flow.NodeId>,
  start: Flow.NodeId
): Flow.NodeId[] => {
  let current = start;
  const totalPath = [current];

  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    totalPath.push(current);
  }

  return totalPath.reverse();
};
