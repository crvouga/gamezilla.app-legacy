import { Err, Ok, Result } from '@gamezilla/shared/core';

//
//
//
// Model
//
//
//

type NodeId = string;

export type Puzzle = {
  nodes: {
    [id: NodeId]: Node;
  };
  edges: {
    [from: NodeId]: {
      [to: NodeId]: Edge;
    };
  };
};

export type Edge = {
  from: string;
  to: string;
};

export type Color = string;

export type TerminalNode = {
  t: 'terminal';
  id: NodeId;
  color: Color;
};

export type PathNode = {
  t: 'path';
  id: NodeId;
  color: Color;
};

export const cutoffPath = (node: PathNode, path: Path): Path => {
  const index = path.path.findIndex((n) => n.id === node.id);

  if (index === -1) {
    return path;
  }
  const pathNew: PathNode[] = path.path.slice(0, index + 1);

  return {
    t: 'invalid',
    start: path.start,
    path: pathNew,
  };
};

export type EmptyNode = {
  t: 'empty';
  id: NodeId;
};

export type Node = EmptyNode | TerminalNode | PathNode;

export const isTerminalNode = (node: Node): node is TerminalNode => {
  return node.t === 'terminal';
};

export const isEmptyNode = (node: Node): node is EmptyNode => {
  return node.t === 'empty';
};

export const isPathNode = (node: Node): node is PathNode => {
  return node.t === 'path';
};

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
    [id: string]: TerminalNode;
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
        'Invalid puzzle. There must be exactly two terminal nodes of the same color'
      );
    }

    if (isColorConnected(puzzle, startNode, endNode)) {
      continue;
    }

    for (const path of yieldValidPaths(puzzle, startNode, endNode)) {
      const added = addPath(puzzle, path);
      if (added.type === 'Err') {
        return added;
      }
      yield* yieldSolutions(added.value, solutions);
    }
  }

  return Ok(null);
};

const addPath = (puzzle: Puzzle, path: ValidPath): Result<string, Puzzle> => {
  const start = puzzle.nodes[path.start.id];

  if (!start) {
    return Err("Invalid puzzle. Start node doesn't exist");
  }

  const end = puzzle.nodes[path.end.id];

  if (!end) {
    return Err("Invalid puzzle. End node doesn't exist");
  }

  const puzzleNew = path.path.reduce<Puzzle>(
    (acc, node) => setNode(acc, node),
    puzzle
  );

  return Ok(puzzleNew);
};

type InvalidPath = {
  t: 'invalid';
  start: TerminalNode;
  path: PathNode[];
};

type ValidPath = {
  t: 'valid';
  start: TerminalNode;
  path: PathNode[];
  end: TerminalNode;
};

type Path = ValidPath | InvalidPath;

const appendPath = (
  _model: Puzzle,
  path: InvalidPath,
  node: EmptyNode
): InvalidPath => {
  return {
    t: 'invalid',
    start: path.start,
    path: [...path.path, { ...node, t: 'path', color: path.start.color }],
  };
};

export const yieldValidPaths = function* (
  puzzle: Puzzle,
  start: TerminalNode,
  target: TerminalNode
): Generator<ValidPath> {
  const visited = new Set<string>();

  const recur = function* (
    node: Node,
    path: InvalidPath
  ): Generator<ValidPath> {
    if (isTerminalNode(node) && node.id === target.id) {
      yield {
        t: 'valid',
        start: path.start,
        path: path.path,
        end: node,
      };
      return;
    }

    for (const neighbor of yieldNeighbors(puzzle, node)) {
      if (visited.has(neighbor.id)) {
        continue;
      }

      if (isTerminalNode(neighbor) && neighbor.color !== target.color) {
        continue;
      }

      if (isPathNode(neighbor) && neighbor.color !== path.start.color) {
        continue;
      }

      visited.add(neighbor.id);

      if (isEmptyNode(neighbor)) {
        const pathNew = appendPath(puzzle, path, neighbor);

        yield* recur(neighbor, pathNew);
      }
    }
  };

  yield* recur(start, { t: 'invalid', start, path: [] });
};

export const isColorConnected = (
  puzzle: Puzzle,
  node: TerminalNode,
  target: TerminalNode,
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
  node: TerminalNode
): Generator<TerminalNode> {
  for (const neighbor of yieldNeighbors(puzzle, node)) {
    if (isTerminalNode(neighbor)) {
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
): Generator<TerminalNode> {
  for (const node of yieldNodes(puzzle)) {
    if (isTerminalNode(node)) {
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
): Generator<{ from: Node; to: Node }> {
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

      yield { from, to };
    }
  }
};

export const findEndNode = (
  puzzle: Puzzle,
  startNode: TerminalNode
): TerminalNode | null => {
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
