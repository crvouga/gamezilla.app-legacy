import { p } from '@gamezilla/core';

//
//
//
// Model
//
//
//

type Position = { x: number; y: number };

type Color =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white';

export type Node = {
  position: Position;
  color?: Color | null;
};

const id = (node: { position: Position }) => {
  return `${node.position.x},${node.position.y}`;
};

export type Edge = {
  from: string;
  to: string;
};

export type Puzzle = {
  nodes: {
    [id: string]: Node;
  };
  edges: {
    [from: string]: {
      [to: string]: Edge;
    };
  };
};

export type Bounds = {
  min: Position;
  max: Position;
};

//
//
//
// Init
//
//
//

export const initGrid = ({ bounds }: { bounds: Bounds }): Puzzle => {
  let puzzle: Puzzle = {
    edges: {},
    nodes: {},
  };

  const deltas: Position[] = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let x = bounds.min.x; x < bounds.max.x; x++) {
    for (let y = bounds.min.y; y < bounds.max.y; y++) {
      const node: Node = { position: { x, y } };
      puzzle = setNode(puzzle, node);
    }
  }

  for (let nodeId in puzzle.nodes) {
    const node = puzzle.nodes[nodeId];

    if (!node) {
      continue;
    }

    const { x, y } = node.position;

    for (const delta of deltas) {
      const to: Node = { position: { x: x + delta.x, y: y + delta.y } };

      if (!puzzle.nodes[id(to)]) {
        continue;
      }

      const edge: Edge = { from: id(node), to: id(to) };

      puzzle = setEdge(puzzle, edge);
    }
  }

  return puzzle;
};

const bounds8x8: Bounds = {
  min: { x: 0, y: 0 },
  max: { x: 0, y: 0 },
};

export const demoGrid = p(
  initGrid({ bounds: bounds8x8 }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'red' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'blue' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'yellow' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'green' })
);

const setNode = (puzzle: Puzzle, node: Node): Puzzle => {
  return {
    ...puzzle,
    nodes: {
      ...puzzle.nodes,
      [id(node)]: {
        ...node,
      },
    },
  };
};

const setEdge = (puzzle: Puzzle, edge: Edge): Puzzle => {
  return {
    ...puzzle,
    edges: {
      ...puzzle.edges,
      [edge.from]: {
        ...puzzle.edges[edge.from],
        [edge.to]: {
          ...edge,
        },
      },
    },
  };
};

//
//
//
// Solver
//
//
//

type SolvedPuzzle = Puzzle & {
  nodes: {
    [id: string]: Node & { color: Color };
  };
};

export const isSolved = (puzzle: Puzzle): puzzle is SolvedPuzzle => {
  // TODO: check if all nodes are colored
  for (const id in puzzle.nodes) {
    const node = puzzle.nodes[id];

    if (!node) {
      continue;
    }

    if (!node.color) {
      return false;
    }
  }

  return true;
};

export const solve = function* (puzzle: Puzzle): Generator<SolvedPuzzle> {
  if (isSolved(puzzle)) {
    yield puzzle;
    return;
  }
};

//
//
//
// View
//
//
//

export const paint = (ctx: CanvasRenderingContext2D, puzzle: Puzzle) => {
  const n = 50;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  for (const id in puzzle.nodes) {
    const node = puzzle.nodes[id];

    if (!node) {
      continue;
    }

    if (node.color) {
      ctx.fillStyle = node.color ?? 'white';
      ctx.fillRect(node.position.x * n, node.position.y * n, n, n);
    }
  }
  return;
};

export const View = (_props: { puzzle: Puzzle }) => {
  return <canvas width="100%" height={'100%'}></canvas>;
};
