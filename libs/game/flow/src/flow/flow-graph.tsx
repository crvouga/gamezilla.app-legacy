import { p } from '@gamezilla/core';

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

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const initGrid = ({ bounds }: { bounds: Bounds }): Puzzle => {
  const puzzle: Puzzle = {
    edges: {},
    nodes: {},
  };

  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const;

  for (let x = bounds.minX; x < bounds.maxX; x++) {
    for (let y = bounds.minY; y < bounds.maxY; y++) {
      const node: Node = {
        position: {
          x,
          y,
        },
      };
      puzzle.nodes[id(node)] = node;

      for (const [dx, dy] of deltas) {
        const to: Node = {
          position: {
            x: x + dx,
            y: y + dy,
          },
        };

        const edge: Edge = {
          from: id(node),
          to: id(to),
        };

        puzzle.edges = {
          ...puzzle.edges,
          [edge.from]: {
            ...puzzle.edges[edge.from],
            [edge.to]: edge,
          },
        };
      }
    }
  }

  return puzzle;
};

const bounds8x8: Bounds = {
  minX: 0,
  maxX: 8,
  minY: 0,
  maxY: 8,
};

export const demoGrid = p(
  initGrid({ bounds: bounds8x8 }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'red' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'blue' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'yellow' }),
  (x) => setNode(x, { position: { x: 0, y: 0 }, color: 'green' })
);

const setNode = (puzzle: Puzzle, node: Node): Puzzle => {
  return { ...puzzle, nodes: { ...puzzle.nodes, [id(node)]: { ...node } } };
};

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
