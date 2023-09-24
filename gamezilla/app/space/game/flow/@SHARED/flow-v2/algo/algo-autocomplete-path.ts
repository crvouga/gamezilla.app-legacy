import { Edge, GroupId, Model, NodeId, yieldEdgesOut } from "../flow";

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
  for (const outEdge of yieldEdgesOut(model, nodeId)) {
    if (outEdge.targetId === nodeId) {
      return nodeId;
    }

    return findPathEndNode(model, groupId, outEdge.targetId);
  }

  return nodeId;
};
