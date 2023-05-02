import { Err, Ok, Result, p } from '@gamezilla/core';

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

export type ColoredNode = {
  position: Position;
  color: Color;
};

export type UncoloredNode = {
  position: Position;
};

export type Node = ColoredNode | UncoloredNode;

export const isColored = (node: Node): node is ColoredNode => {
  return 'color' in node;
};

export const isUncolored = (node: Node): node is UncoloredNode => {
  return !isColored(node);
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

const puzzleToKey = (puzzle: Puzzle): string => {
  // TODO this must be deterministic and it's not
  return JSON.stringify(puzzle);
};

export const yieldSolutions = function* (
  puzzle: Puzzle,
  solutions = new Set<string>()
): Generator<SolvedPuzzle, Result<string, null>> {
  if (solutions.add(puzzleToKey(puzzle))) {
    return Ok(null);
  }

  if (isSolved(puzzle)) {
    solutions.add(puzzleToKey(puzzle));
    yield puzzle;
    return Ok(null);
  }

  for (const startNode of yieldColoredNodes(puzzle)) {
    const endNode = findEndNode(puzzle, startNode);

    if (!endNode) {
      return Err(
        'Invalid puzzle. There must be exactly two nodes of each color.'
      );
    }

    if (isConnected(puzzle, startNode, endNode)) {
      continue;
    }

    for (const path of yieldUncoloredPaths(puzzle, startNode, endNode)) {
      const colored = colorPath(puzzle, startNode.color, path);
      yield* yieldSolutions(colored, solutions);
    }
  }

  return Ok(null);
};

type UncoloredPath = {
  node: UncoloredNode;
  next: UncoloredPath | null;
};

const colorPath = (
  puzzle: Puzzle,
  _color: Color,
  _path: UncoloredPath
): Puzzle => {
  return puzzle;
};

const yieldUncoloredPaths = function* (
  _puzzle: Puzzle,
  _startNode: ColoredNode,
  _endNode: ColoredNode
): Generator<UncoloredPath> {};

const isConnected = (
  puzzle: Puzzle,
  node: ColoredNode,
  target: ColoredNode,
  visited = new Set<string>()
): boolean => {
  if (visited.has(id(node))) {
    return false;
  }

  visited.add(id(node));

  if (id(node) === id(target)) {
    return true;
  }

  for (const neighbor of yieldColoredNeighbors(puzzle, node)) {
    if (isConnected(puzzle, neighbor, target, visited)) {
      return true;
    }
  }

  return false;
};

const yieldColoredNeighbors = function* (
  puzzle: Puzzle,
  node: ColoredNode
): Generator<ColoredNode> {
  for (const neighbor of yieldNeighbors(puzzle, node)) {
    if (isColored(neighbor)) {
      yield neighbor;
    }
  }
};

const yieldNeighbors = function* (puzzle: Puzzle, node: Node): Generator<Node> {
  for (const neighborId in puzzle.edges[id(node)]) {
    const neighbor = puzzle.nodes[neighborId];

    if (!neighbor) {
      continue;
    }

    yield neighbor;
  }
};

const yieldColoredNodes = function* (puzzle: Puzzle): Generator<ColoredNode> {
  for (const node of yieldNodes(puzzle)) {
    if (isColored(node)) {
      yield node;
    }
  }
};

const yieldNodes = function* (puzzle: Puzzle): Generator<Node> {
  for (const id in puzzle.nodes) {
    const node = puzzle.nodes[id];
    if (!node) {
      continue;
    }
    yield node;
  }
};

const findEndNode = (
  puzzle: Puzzle,
  startNode: ColoredNode
): ColoredNode | null => {
  for (const node of yieldColoredNodes(puzzle)) {
    if (id(node) === id(startNode)) {
      continue;
    }

    if (node.color === startNode.color) {
      return node;
    }
  }

  return null;
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

  for (const node of yieldColoredNodes(puzzle)) {
    ctx.fillStyle = node.color;
    ctx.fillRect(node.position.x * n, node.position.y * n, n, n);
  }
  return;
};

export const View = (_props: { puzzle: Puzzle }) => {
  return <canvas width="100%" height={'100%'}></canvas>;
};
