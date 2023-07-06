import { Model, Node, Edge } from "./flow";

export const isModel = (model: unknown): model is Model => {
  return (
    typeof model === "object" &&
    model !== null &&
    "nodes" in model &&
    "edges" in model &&
    "edgesIn" in model &&
    "edgesOut" in model &&
    typeof model.nodes === "object" &&
    typeof model.edges === "object" &&
    typeof model.edgesIn === "object" &&
    typeof model.edgesOut === "object" &&
    model.nodes !== null &&
    model.edges !== null &&
    model.edgesIn !== null &&
    model.edgesOut !== null &&
    Object.values(model.nodes).every(isNode) &&
    Object.values(model.edges).every(isEdge)
  );
};

export const isNode = (node: unknown): node is Node => {
  return (
    typeof node === "object" &&
    node !== null &&
    "nodeId" in node &&
    typeof node.nodeId === "string"
  );
};

export const isEdge = (edge: unknown): edge is Edge => {
  return (
    typeof edge === "object" &&
    edge !== null &&
    "from" in edge &&
    "to" in edge &&
    typeof edge.from === "string" &&
    typeof edge.to === "string"
  );
};
