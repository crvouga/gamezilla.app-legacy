import { Flow } from "..";
import { Bounds, Position, DELTAS, yieldRange } from "./flow-grid-position";

//
//
//
// Model
//
//
//

export type Model = {
  type: "flow-grid";
  flow: Flow.Model;
  bounds: Bounds;
  positions: {
    [nodeId: Flow.NodeId]: Position;
  };
};

export const positionToNodeId = (position: Position): Flow.NodeId => {
  return Flow.createNodeId(`${position.x},${position.y}`);
};

export const distance =
  (model: Model) =>
  (a: Flow.NodeId, b: Flow.NodeId): number => {
    const positionA = model.positions[a];

    if (!positionA) {
      return Infinity;
    }

    const positionB = model.positions[b];

    if (!positionB) {
      return Infinity;
    }

    return Position.distance(positionA, positionB);
  };

//
//
//
// Init
//
//
//

export const init = ({ bounds }: { bounds: Bounds }): Model => {
  let model: Model = {
    type: "flow-grid",
    flow: Flow.init,
    bounds,
    positions: {},
  };

  for (const position of yieldRange({ bounds })) {
    model = addNode(model, position);
  }

  for (const nodePosition of yieldPositions(model)) {
    for (const delta of DELTAS) {
      const to: Position = {
        x: nodePosition.x + delta.x,
        y: nodePosition.y + delta.y,
      };

      if (!model.flow.nodes[positionToNodeId(to)]) {
        continue;
      }

      const edge: Flow.Edge = {
        sourceId: positionToNodeId(nodePosition),
        targetId: positionToNodeId(to),
      };

      model.flow = Flow.addEdge(model.flow, edge);
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
  source: Node;
  target: Node;
};

export const toNode = (model: Model, nodeId: Flow.NodeId): Node | null => {
  const node = Flow.toNode(model.flow, nodeId);

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
  const edge = Flow.toEdge(model.flow, edgeId);

  if (!edge) {
    return null;
  }

  const source = toNode(model, edge.sourceId);

  if (!source) {
    return null;
  }

  const target = toNode(model, edge.targetId);

  if (!target) {
    return null;
  }

  return {
    ...edge,
    source: source,
    target: target,
  };
};

/**
 * Adds a node to the puzzle.
 */
export const addNode = (model: Model, position: Position): Model => {
  const nodeId = positionToNodeId(position);
  const added = Flow.addNode(model.flow, { nodeId });
  return {
    ...model,
    flow: added,
    positions: {
      ...model.positions,
      [nodeId]: position,
    },
  };
};

export const yieldPositions = function* (model: Model): Generator<Position> {
  for (const node of Flow.yieldNodes(model.flow)) {
    const position = model.positions[node.nodeId];
    if (!position) {
      continue;
    }
    yield position;
  }
};

export const yieldEdges = function* (model: Model): Generator<Edge> {
  for (const edge of Flow.yieldEdges(model.flow)) {
    const source = toNode(model, edge.sourceId);

    if (!source) {
      continue;
    }

    const target = toNode(model, edge.targetId);

    if (!target) {
      continue;
    }

    yield { ...edge, source, target };
  }
};

export const yieldNodes = function* (model: Model): Generator<Node> {
  for (const node of Flow.yieldNodes(model.flow)) {
    const position = model.positions[node.nodeId];
    if (!position) {
      continue;
    }
    yield { ...position, ...node };
  }
};

export type Terminal = Flow.Terminal & {
  start: Node;
  end?: Node | null;
};

export const yieldTerminals = function* (model: Model): Generator<Terminal> {
  for (const terminal of Flow.yieldTerminals(model.flow)) {
    const start = toNode(model, terminal.startId);

    if (!start) {
      continue;
    }

    const end = terminal.endId ? toNode(model, terminal.endId) ?? null : null;

    yield { ...terminal, start, end };
  }
};

type PipeJoined = Flow.PipeJoined & {
  source: Node;
  target: Node;
};

export const yieldPipes = function* (model: Model): Generator<PipeJoined> {
  for (const pipe of Flow.yieldPipes(model.flow)) {
    const source = toNode(model, pipe.edge.sourceId);

    if (!source) {
      continue;
    }

    const target = toNode(model, pipe.edge.targetId);

    if (!target) {
      continue;
    }

    yield {
      ...pipe,
      source,
      target,
    };
  }
};
