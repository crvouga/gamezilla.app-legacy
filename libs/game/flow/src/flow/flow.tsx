import { Err, NonEmpty, Ok, Result } from '@gamezilla/core';

//
//
//
// Model
//
//
//

export type Position = { x: number; y: number };

export type Color = string;

export type ColoredNode = Position & {
  color: Color;
};

export type UncoloredNode = Position;

export type Node = ColoredNode | UncoloredNode;

export const isColored = (node: Node): node is ColoredNode => {
  return 'color' in node;
};

export const isUncolored = (node: Node): node is UncoloredNode => {
  return !isColored(node);
};

export const id = (node: UncoloredNode) => {
  return `${node.x},${node.y}`;
};

export type Edge = {
  from: string;
  to: string;
};

export type Puzzle = {
  bounds: Bounds;
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

export type Path = string[];

export const addNodeToPath = (path: Path, nodeId: string): Path => {
  if (!NonEmpty.is(path)) {
    return [nodeId];
  }

  const endNodeId = path[path.length - 1];

  if (!endNodeId) {
    return [nodeId];
  }

  if (endNodeId === nodeId) {
    return path;
  }

  const nodeIndex = path.indexOf(nodeId);

  if (nodeIndex !== -1) {
    return path.slice(0, nodeIndex + 1);
  }

  return [...path, nodeId];
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
    bounds,
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
      const node: Node = { x, y };
      puzzle = setNode(puzzle, node);
    }
  }

  for (const nodeId in puzzle.nodes) {
    const node = puzzle.nodes[nodeId];

    if (!node) {
      continue;
    }

    const { x, y } = node;

    for (const delta of deltas) {
      const to: Node = { x: x + delta.x, y: y + delta.y };

      if (!puzzle.nodes[id(to)]) {
        continue;
      }

      const edge: Edge = { from: id(node), to: id(to) };

      puzzle = setEdge(puzzle, edge);
    }
  }

  return puzzle;
};

export const bounds8x8: Bounds = {
  min: { x: 0, y: 0 },
  max: { x: 8, y: 8 },
};

export const setNode = (puzzle: Puzzle, node: Node): Puzzle => {
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

export const setEdge = (puzzle: Puzzle, edge: Edge): Puzzle => {
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
    [id: string]: ColoredNode;
  };
};

export const isSolved = (puzzle: Puzzle): puzzle is SolvedPuzzle => {
  for (const nodeA of yieldColoredNodes(puzzle)) {
    for (const nodeB of yieldColoredNodes(puzzle)) {
      if (
        nodeA.color === nodeB.color &&
        !isColorConnected(puzzle, nodeA, nodeB)
      ) {
        return false;
      }
    }
  }
  return true;
};

const puzzleToKey = (puzzle: Puzzle): string => {
  const nodeIds = Object.keys(puzzle.nodes).sort();
  const edgeIds = Object.entries(puzzle.edges)
    .reduce<string[]>((acc, [from, nodes]) => {
      const nodeIds = Object.keys(nodes).sort();
      return [...acc, ...nodeIds.map((to) => `${from}-${to}`)];
    }, [])
    .sort();
  return `${nodeIds.join(',')}|${edgeIds.join(',')}`;
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

    if (isColorConnected(puzzle, startNode, endNode)) {
      continue;
    }

    for (const path of yieldUncoloredPaths(puzzle, startNode, endNode)) {
      const colored = colorUncoloredPath(puzzle, startNode.color, path);
      yield* yieldSolutions(colored, solutions);
    }
  }

  return Ok(null);
};

const colorUncoloredPath = (
  puzzle: Puzzle,
  _color: Color,
  _path: UncoloredNode[]
): Puzzle => {
  return puzzle;
};

export const yieldUncoloredPaths = function* (
  puzzle: Puzzle,
  node: UncoloredNode,
  target: ColoredNode,
  path: UncoloredNode[] = [],
  visited = new Set<string>()
): Generator<UncoloredNode[]> {
  path.push(node);
  visited.add(id(node));

  if (id(node) === id(target)) {
    yield [...path];
    return;
  }

  for (const neighbor of yieldNeighbors(puzzle, node)) {
    if (visited.has(id(neighbor))) {
      continue;
    }

    if (isColored(neighbor) && neighbor.color !== target.color) {
      continue;
    }

    visited.add(id(neighbor));

    yield* yieldUncoloredPaths(puzzle, neighbor, target, path, visited);
  }

  path.pop();
  visited.delete(id(node));
};

export const isColorConnected = (
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
    if (isColorConnected(puzzle, neighbor, target, visited)) {
      return true;
    }
  }

  return false;
};

export const yieldColoredNeighbors = function* (
  puzzle: Puzzle,
  node: ColoredNode
): Generator<ColoredNode> {
  for (const neighbor of yieldNeighbors(puzzle, node)) {
    if (isColored(neighbor)) {
      yield neighbor;
    }
  }
};

export const yieldNeighbors = function* (
  puzzle: Puzzle,
  node: Node
): Generator<Node> {
  for (const neighborId in puzzle.edges[id(node)]) {
    const neighbor = puzzle.nodes[neighborId];

    if (!neighbor) {
      continue;
    }

    yield neighbor;
  }
};

export const yieldColoredNodes = function* (
  puzzle: Puzzle
): Generator<ColoredNode> {
  for (const node of yieldNodes(puzzle)) {
    if (isColored(node)) {
      yield node;
    }
  }
};

export const yieldNodes = function* (puzzle: Puzzle): Generator<Node> {
  for (const id in puzzle.nodes) {
    const node = puzzle.nodes[id];
    if (!node) {
      continue;
    }
    yield node;
  }
};

export const findEndNode = (
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
