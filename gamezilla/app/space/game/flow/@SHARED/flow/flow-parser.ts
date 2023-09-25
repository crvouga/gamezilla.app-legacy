import { has, isObj } from "gamezilla/@SHARED/core";
import { Model, Node, Edge } from "./flow";

export const toModel = (x: unknown): Model | null => {
  if (
    isObj(x) &&
    has(x, "nodes", isObj) &&
    has(x, "edges", isObj) &&
    has(x, "indexEdgesIn", isObj) &&
    has(x, "indexEdgesOut", isObj)
  ) {
    return null;
  }
  return null;
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
