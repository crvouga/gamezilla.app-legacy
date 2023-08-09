import {
  Edge,
  Model,
  NodeId,
  GroupId,
  findTerminal,
  yieldOutEdges,
} from "./flow";

/**
 *
 */
export const toAutocompleteEdge = (
  model: Model,
  groupId: GroupId
): Edge | null => {
  const terminal = model.terminals[groupId];

  if (!terminal) {
    return null;
  }

  const endId = findPathEndNode(model, groupId, terminal.startId);

  if (!endId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, endId)) {
    const terminal = findTerminal(model, edge.target);

    if (terminal && terminal.groupId === groupId) {
      return edge;
    }
  }

  return null;
};

const findPathEndNode = (
  model: Model,
  groupId: GroupId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.groupId !== groupId) {
      continue;
    }

    if (outEdge.target === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, groupId, outEdge.target);
  }

  return nodeId;
};
