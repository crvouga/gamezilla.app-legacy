import * as Flow from "../flow";

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
