import {
  Edge,
  Model,
  NodeId,
  PathId,
  findTerminalFromNode,
  yieldOutEdges,
} from "./flow";

/**
 *
 */
export const toAutocompleteEdge = (
  model: Model,
  pathId: PathId
): Edge | null => {
  const terminal = model.terminals[pathId];

  if (!terminal) {
    return null;
  }

  const endId = findPathEndNode(model, pathId, terminal.startId);

  if (!endId) {
    return null;
  }

  for (const edge of yieldOutEdges(model, endId)) {
    const terminal = findTerminalFromNode(model, edge.to);

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

    if (outEdge.to === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, pathId, outEdge.to);
  }

  return nodeId;
};
