import { Parsing as P } from "gamezilla/@SHARED/parsing";
import { Model, Node, Edge } from "./flow";

export const toModel = (x: unknown): Model | null => {
  if (
    P.obj(x) &&
    P.has(x, "nodes", P.obj) &&
    P.has(x, "edges", P.obj) &&
    P.has(x, "indexEdgesIn", P.obj) &&
    P.has(x, "indexEdgesOut", P.obj)
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
