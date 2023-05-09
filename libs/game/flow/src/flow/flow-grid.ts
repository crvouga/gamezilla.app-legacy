import * as Flow from './flow';

export type Position = { x: number; y: number };

export type Bounds = {
  min: Position;
  max: Position;
};

export type GridPuzzle = Flow.Puzzle & {
  bounds: Bounds;
  positions: {
    [nodeId: string]: Position;
  };
};

export const positionToId = (position: Position): string => {
  return `${position.x},${position.y}`;
};

export const init = ({ bounds }: { bounds: Bounds }): GridPuzzle => {
  let puzzle: GridPuzzle = {
    bounds,
    edges: {},
    nodes: {},
    positions: {},
  };

  for (const position of yieldPositionRange({ bounds })) {
    const id = positionToId(position);
    puzzle = Flow.setNode(puzzle, { id });
    puzzle.positions[id] = position;
  }

  const deltas: Position[] = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (const nodePosition of yieldPositions(puzzle)) {
    for (const delta of deltas) {
      const to: Position = {
        x: nodePosition.x + delta.x,
        y: nodePosition.y + delta.y,
      };

      if (!puzzle.nodes[positionToId(to)]) {
        continue;
      }

      const edge: Flow.Edge = {
        from: positionToId(nodePosition),
        to: positionToId(to),
      };

      puzzle = Flow.setEdge(puzzle, edge);
    }
  }

  return puzzle;
};

export const bounds8x8: Bounds = {
  min: { x: 0, y: 0 },
  max: { x: 8, y: 8 },
};

const yieldPositionRange = function* ({
  bounds,
}: {
  bounds: Bounds;
}): Generator<Position> {
  for (let x = bounds.min.x; x < bounds.max.x; x++) {
    for (let y = bounds.min.y; y < bounds.max.y; y++) {
      yield { x, y };
    }
  }
};

const yieldPositions = function* (puzzle: GridPuzzle): Generator<Position> {
  for (const nodeId in puzzle.nodes) {
    const position = puzzle.positions[nodeId];
    if (!position) {
      continue;
    }
    yield position;
  }
};

export type GridNode = Flow.Node & Position;

export type GridEdge = {
  from: GridNode;
  to: GridNode;
  color?: Flow.Color;
};

export const yieldEdges = function* (puzzle: GridPuzzle): Generator<GridEdge> {
  for (const fromId in puzzle.edges) {
    const edges = puzzle.edges[fromId];

    if (!edges) {
      continue;
    }

    const from = puzzle.nodes[fromId];

    if (!from) {
      continue;
    }

    const fromPosition = puzzle.positions[fromId];

    if (!fromPosition) {
      continue;
    }

    for (const toId in edges[fromId]) {
      const to = puzzle.nodes[toId];

      if (!to) {
        continue;
      }

      const toPosition = puzzle.positions[toId];

      if (!toPosition) {
        continue;
      }

      yield {
        from: { ...fromPosition, id: fromId },
        to: { ...toPosition, id: toId },
      };
    }
  }
};

export const yieldNodes = function* (puzzle: GridPuzzle): Generator<GridNode> {
  for (const node of Flow.yieldNodes(puzzle)) {
    const position = puzzle.positions[node.id];
    if (!position) {
      continue;
    }
    yield { ...position, ...node };
  }
};

export const yieldColoredNodes = function* (
  puzzle: GridPuzzle
): Generator<GridNode & Flow.ColoredNode> {
  for (const node of yieldNodes(puzzle)) {
    if (Flow.isColored(node)) {
      yield node;
    }
  }
};

export const setNode = (
  puzzle: GridPuzzle,
  node: Position & { color?: Flow.Color }
): GridPuzzle => {
  const id = positionToId(node);
  return {
    ...puzzle,
    nodes: {
      ...puzzle.nodes,
      [id]: { id, color: node.color },
    },
    positions: {
      ...puzzle.positions,
      [id]: node,
    },
  };
};
