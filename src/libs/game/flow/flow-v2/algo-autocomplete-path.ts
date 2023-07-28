import { Edge, Model, NodeId, GroupId, yieldOutEdges } from "./flow";

/**
 *
 */
export const toAutocompleteEdge = (
  _model: Model,
  _groupId: GroupId
): Edge | null => {
  return null;
};

const findPathEndNode = (
  model: Model,
  groupId: GroupId,
  nodeId: NodeId
): NodeId => {
  for (const outEdge of yieldOutEdges(model, nodeId)) {
    if (outEdge.targetId === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, groupId, outEdge.targetId);
  }

  return nodeId;
};
