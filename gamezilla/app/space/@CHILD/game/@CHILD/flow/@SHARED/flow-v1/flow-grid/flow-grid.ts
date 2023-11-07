import { Flow } from "..";
import { Bounds, Position, deltas, yieldRange } from "./flow-grid-position";

//
//
//
// Model
//
//
//

export type Model = Flow.Model & {
  bounds: Bounds;
  positions: {
    [nodeId: Flow.NodeId]: Position;
  };
};

export const positionToId = (position: Position): Flow.NodeId => {
  return `${position.x},${position.y}` as Flow.NodeId;
};

//
//
//
// Init
//
//
//

export const initEmpty = ({ bounds }: { bounds: Bounds }): Model => {
  let model: Model = {
    ...Flow.initEmpty,
    bounds,
    positions: {},
  };

  for (const position of yieldRange({ bounds })) {
    model = addNode(model, position);
  }

  for (const nodePosition of yieldPositions(model)) {
    for (const delta of deltas) {
      const to: Position = {
        x: nodePosition.x + delta.x,
        y: nodePosition.y + delta.y,
      };

      if (!model.nodes[positionToId(to)]) {
        continue;
      }

      const edge: Flow.Edge = {
        source: positionToId(nodePosition),
        target: positionToId(to),
      };

      model = Flow.addEdge(model, edge);
    }
  }

  return model;
};

//
//
//
// Accessors
//
//
//

export type Node = Flow.Node & Position;

export type Edge = Flow.Edge & {
  nodeFrom: Node;
  nodeTo: Node;
};

export const toNode = (
  model: Pick<Model, "nodes" | "positions">,
  nodeId: Flow.NodeId
): Node | null => {
  const node = Flow.toNode(model, nodeId);

  if (!node) {
    return null;
  }

  const position = model.positions[node.nodeId];

  if (!position) {
    return null;
  }

  return {
    ...position,
    ...node,
  };
};

export const toEdge = (model: Model, edgeId: Flow.EdgeId): Edge | null => {
  const edge = Flow.toEdge(model, edgeId);

  if (!edge) {
    return null;
  }

  const from = toNode(model, edge.source);

  if (!from) {
    return null;
  }

  const to = toNode(model, edge.target);

  if (!to) {
    return null;
  }

  return {
    ...edge,
    nodeFrom: from,
    nodeTo: to,
  };
};

//
//
//
//
//
//

export const addNode = (model: Model, position: Position): Model => {
  const nodeId = positionToId(position);
  const added = Flow.addNode(model, nodeId);
  return {
    ...added,
    positions: {
      ...added.positions,
      [nodeId]: position,
    },
  };
};

//
//
//
//
//
//
//

export const yieldPositions = function* (model: Model): Generator<Position> {
  for (const node of Flow.yieldNodes(model)) {
    const position = model.positions[node.nodeId];
    if (!position) {
      continue;
    }
    yield position;
  }
};

export const yieldEdges = function* (
  model: Pick<Model, "edges" | "nodes" | "positions">
): Generator<Edge> {
  for (const edge of Flow.yieldEdges(model)) {
    const from = toNode(model, edge.source);

    if (!from) {
      continue;
    }

    const to = toNode(model, edge.target);

    if (!to) {
      continue;
    }

    yield {
      ...edge,
      nodeFrom: from,
      nodeTo: to,
    };
  }
};

export const yieldNodes = function* (
  model: Pick<Model, "nodes" | "positions">
): Generator<Node> {
  for (const node of Flow.yieldNodes(model)) {
    const position = model.positions[node.nodeId];
    if (!position) {
      continue;
    }
    yield { ...position, ...node };
  }
};
