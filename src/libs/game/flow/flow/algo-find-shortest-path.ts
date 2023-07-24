import {
  EdgeId,
  Model,
  NodeId,
  findPath,
  findPathTerminal,
  toEdgeId,
  yieldOutEdges,
} from "./flow";

export const findShortestEmptyPath = ({
  model,
  source,
  target,
}: {
  model: Model;
  source: NodeId;
  target: NodeId;
}): EdgeId[] => {
  const pathId = findPath(model, source);
  const terminal = findPathTerminal(model, source);
  const sourcePathId = pathId ?? terminal?.pathId;
  if (!sourcePathId) {
    return [];
  }
  //
  //
  // Construct the breadth first tree
  //
  //
  const queue: NodeId[] = [];
  const visited = new Set<NodeId>();
  const tree: { [id: NodeId]: { parent?: NodeId } } = {};

  visited.add(source);
  queue.push(source);

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
      const adjacentId = outEdge.target;

      if (visited.has(adjacentId)) {
        continue;
      }

      const adjacentPathId = findPath(model, adjacentId);

      if (adjacentPathId && adjacentPathId !== sourcePathId) {
        continue;
      }

      const adjacentPathTerminal = findPathTerminal(model, adjacentId);

      if (
        adjacentPathTerminal &&
        adjacentPathTerminal.pathId !== sourcePathId
      ) {
        continue;
      }

      queue.push(adjacentId);
      tree[adjacentId] = { parent: current };
    }
  }

  //
  //
  // Construct the path from the breadth first tree
  //
  //

  let current = target;
  const nodePath: NodeId[] = [current];

  while (current !== source) {
    const parent = tree[current]?.parent;

    if (!parent) {
      break;
    }

    nodePath.push(parent);
    current = parent;
  }

  nodePath.reverse();

  //
  //
  // Convert node path to edge path
  //
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
    path.push(toEdgeId({ source: from, target: to }));
  }

  //
  //
  // Done
  //
  //

  return path;
};
