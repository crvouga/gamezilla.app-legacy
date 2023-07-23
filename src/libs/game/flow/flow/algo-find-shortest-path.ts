import { isNodeInPath } from "./algo-draw-path";
import {
  EdgeId,
  Model,
  NodeId,
  nodeToPath,
  nodeToTerminal,
  toEdgeId,
  yieldOutEdges,
} from "./flow";

export const findShortestEmptyPath = ({
  model,
  start,
  target,
}: {
  model: Model;
  start: NodeId;
  target: NodeId;
}): EdgeId[] => {
  //
  //
  // Construct the breadth first tree
  //
  //
  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: { [id: NodeId]: { parent?: NodeId } } = {};

  visited.add(start);
  queue.push(start);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    visited.add(current);

    if (current === target) {
      break;
    }

    for (const outEdge of yieldOutEdges(model, current)) {
      const adjacentId = outEdge.to;

      if (visited.has(adjacentId)) {
        continue;
      }

      if (isNodeInPath(model, adjacentId)) {
        continue;
      }

      const terminal = nodeToTerminal(model, adjacentId);

      if (terminal && terminal.pathId === nodeToPath(model, start)) {
        continue;
      }

      queue.push(adjacentId);
      tree[adjacentId] = { parent: current };
    }
  }

  //
  // Construct the path from the breadth first tree
  //

  let current = target;
  const nodePath: NodeId[] = [current];

  while (current !== start) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  //
  // Convert node path to edge path
  //

  const path: EdgeId[] = [];

  for (let i = 0; i < nodePath.length; i++) {
    const from = nodePath[i];
    if (!from) {
      continue;
    }
    const to = nodePath[i + 1];
    if (!to) {
      continue;
    }
    path.push(toEdgeId({ from, to }));
  }

  //
  // Done
  //

  return path;
};
