import { Err, Ok, Result } from '@gamezilla/shared/core';

//
//
//
// Model
//
//
//

export type Color = string;

export type ColoredNode = {
  id: string;
  color: Color;
};

export type UncoloredNode = {
  id: string;
};

export type Node = ColoredNode | UncoloredNode;

export const isColored = (node: Node): node is ColoredNode => {
  return 'color' in node;
};

export const isUncolored = (node: Node): node is UncoloredNode => {
  return !isColored(node);
};

export type Edge = {
  from: string;
  to: string;
  color?: Color;
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

export type Path = string[];

export const setNode = <T extends Puzzle>(puzzle: T, node: Node): T => {
  return {
    ...puzzle,
    nodes: {
      ...puzzle.nodes,
      [node.id]: {
        ...node,
      },
    },
  };
};

export const setEdge = <T extends Puzzle>(puzzle: T, edge: Edge): T => {
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
  visited.add(node.id);

  if (node.id === target.id) {
    yield [...path];
    return;
  }

  for (const neighbor of yieldNeighbors(puzzle, node)) {
    if (visited.has(neighbor.id)) {
      continue;
    }

    if (isColored(neighbor) && neighbor.color !== target.color) {
      continue;
    }

    visited.add(neighbor.id);

    yield* yieldUncoloredPaths(puzzle, neighbor, target, path, visited);
  }

  path.pop();
  visited.delete(node.id);
};

export const isColorConnected = (
  puzzle: Puzzle,
  node: ColoredNode,
  target: ColoredNode,
  visited = new Set<string>()
): boolean => {
  if (visited.has(node.id)) {
    return false;
  }

  visited.add(node.id);

  if (node.id === target.id) {
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
  for (const neighborId in puzzle.edges[node.id]) {
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

export const yieldEdges = function* (
  puzzle: Puzzle
): Generator<{ from: Node; to: Node; color?: string }> {
  for (const fromId in puzzle.edges) {
    for (const toId in puzzle.edges[fromId]) {
      const from = puzzle.nodes[fromId];

      if (!from) {
        continue;
      }

      const to = puzzle.nodes[toId];

      if (!to) {
        continue;
      }

      if (!from || !to) {
        continue;
      }

      const edge = puzzle.edges[fromId]?.[toId];

      if (!edge) {
        continue;
      }

      yield { from, to, color: edge.color };
    }
  }
};

export const findEndNode = (
  puzzle: Puzzle,
  startNode: ColoredNode
): ColoredNode | null => {
  for (const node of yieldColoredNodes(puzzle)) {
    if (node.id === startNode.id) {
      continue;
    }

    if (node.color === startNode.color) {
      return node;
    }
  }

  return null;
};
