import { Model, NodeId } from "../flow";

/**
 * Returns a list of edges without a groupId that form the shortest path between the source and target nodes.
 */
export const findShortestEmptyPath = (
  _model: Model,
  _sourceId: NodeId,
  _targetId: NodeId
): NodeId[] => {
  return [];
  // const groupId = findPath(model, source);
  // const terminal = findTerminal(model, source);
  // const sourceGroupId = groupId ?? terminal?.groupId;
  // if (!sourceGroupId) {
  //   return [];
  // }
  //
  //
  // Construct the breadth first tree
  //
  //
  // const queue: NodeId[] = [];
  // const visited = new Set<NodeId>();
  // const tree: { [id: NodeId]: { parent?: NodeId } } = {};

  // visited.add(source);
  // queue.push(source);

  // while (queue.length > 0) {
  //   const current = queue.shift();

  //   if (!current) {
  //     break;
  //   }

  //   visited.add(current);

  //   if (current === target) {
  //     break;
  //   }

  //   for (const outEdge of yieldOutEdges(model, current)) {
  //     const adjacentId = outEdge.targetId;

  //     if (visited.has(adjacentId)) {
  //       continue;
  //     }

  //     const adjacentGroupId = findPath(model, adjacentId);

  //     if (adjacentGroupId && adjacentGroupId !== sourceGroupId) {
  //       continue;
  //     }

  //     const adjacentTerminal = findTerminal(model, adjacentId);

  //     if (adjacentTerminal && adjacentTerminal.groupId !== sourceGroupId) {
  //       continue;
  //     }

  //     queue.push(adjacentId);
  //     tree[adjacentId] = { parent: current };
  //   }
  // }

  //
  //
  // Construct the path from the breadth first tree
  //
  //

  // let current = target;
  // const nodePath: NodeId[] = [current];

  // while (current !== source) {
  //   const parent = tree[current]?.parent;

  //   if (!parent) {
  //     break;
  //   }

  //   nodePath.push(parent);
  //   current = parent;
  // }

  // nodePath.reverse();

  //
  //
  // Convert node path to edge path
  //
  //

  // const path: EdgeId[] = [];

  // for (let i = 0; i < nodePath.length; i++) {
  //   const from = nodePath[i];
  //   if (!from) {
  //     continue;
  //   }
  //   const to = nodePath[i + 1];
  //   if (!to) {
  //     continue;
  //   }
  //   path.push(toEdgeId({ sourceId: from, targetId: to }));
  // }

  //
  //
  // Done
  //
  //

  // return path;
};
