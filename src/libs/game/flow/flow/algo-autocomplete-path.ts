import {
  Edge,
  Model,
  NodeId,
  PathId,
  findPathTerminal,
  yieldOutEdges,
} from "./flow";

/**
 *
 */
export const toAutocompleteEdge = (
  model: Model,
  pathId: PathId
): Edge | null => {
  const terminal = model.pathTerminals[pathId];

  if (!terminal) {
    return null;
  }

  const endId = findPathEndNode(model, pathId, terminal.startId);

  if (!endId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, endId)) {
    const terminal = findPathTerminal(model, edge.target);

    if (terminal && terminal.pathId === pathId) {
      return edge;
    }
  }

  return null;
};

const findPathEndNode = (
  model: Model,
  pathId: PathId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.pathId !== pathId) {
      continue;
    }

    if (outEdge.target === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, pathId, outEdge.target);
  }

  return nodeId;
};
