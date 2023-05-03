import { Err, NonEmpty, Ok, Result, rescale } from '@gamezilla/core';
import { useLayoutEffect } from 'react';

//
//
//
// Model
//
//
//

type Position = { x: number; y: number };

type Color = string;

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

const id = (node: UncoloredNode) => {
  return `${node.x},${node.y}`;
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

const yieldUncoloredPaths = function* (
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

const isColorConnected = (
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

const toBounds = (puzzle: Puzzle): Bounds => {
  const min = { x: Infinity, y: Infinity };
  const max = { x: -Infinity, y: -Infinity };

  for (const node of yieldNodes(puzzle)) {
    min.x = Math.min(min.x, node.x);
    min.y = Math.min(min.y, node.y);
    max.x = Math.max(max.x, node.x);
    max.y = Math.max(max.y, node.y);
  }

  return { max, min };
};

//
//
//
// View
//
//
//

export const paint = (
  ctx: CanvasRenderingContext2D,
  { puzzle, pathByColor }: ViewModel
) => {
  const bounds = toBounds(puzzle);
  const squareLength = ctx.canvas.width / (bounds.max.x - bounds.min.x);

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);
  paintGrid(ctx, bounds);
  for (const node of yieldColoredNodes(puzzle)) {
    ctx.fillStyle = node.color;

    ctx.fillRect(
      node.x * squareLength,
      node.y * squareLength,
      squareLength,
      squareLength
    );
  }

  for (const color in pathByColor) {
    ctx.fillStyle = color;

    const path = pathByColor[color];

    if (!path) {
      continue;
    }

    for (const nodeId of path) {
      const node = puzzle.nodes[nodeId];

      if (!node) {
        continue;
      }

      ctx.fillRect(
        node.x * squareLength,
        node.y * squareLength,
        squareLength,
        squareLength
      );
    }
  }
};

const paintGrid = (ctx: CanvasRenderingContext2D, bounds: Bounds) => {
  const squareLength = ctx.canvas.width / (bounds.max.x - bounds.min.x);
  for (let x = 0; x < bounds.max.x; x++) {
    for (let y = 0; y < bounds.max.y; y++) {
      ctx.strokeStyle = '#676767';
      ctx.strokeRect(
        x * squareLength,
        y * squareLength,
        squareLength,
        squareLength
      );
    }
  }
};

export type ViewMsg =
  | { t: 'mouse-move'; nodeId: string }
  | { t: 'mouse-down'; nodeId: string }
  | { t: 'mouse-up'; nodeId: string }
  | { t: 'mouse-leave' };

export type ViewModel = {
  puzzle: Puzzle;
  pathByColor: { [color: string]: Path };
  mouseStatus: 'up' | 'down';
  activeColor?: string | null;
};

export const initViewModel = (puzzle: Puzzle): ViewModel => ({
  puzzle,
  pathByColor: {},
  mouseStatus: 'up',
});

export const update = ({
  msg,
  model,
}: {
  msg: ViewMsg;
  model: ViewModel;
}): {
  model: ViewModel;
} => {
  if (
    msg.t === 'mouse-move' &&
    model.mouseStatus === 'down' &&
    typeof model.activeColor === 'string'
  ) {
    return {
      model: {
        ...model,
        pathByColor: {
          ...model.pathByColor,
          [model.activeColor]: addNodeToPath(
            model.pathByColor[model.activeColor] ?? [],
            msg.nodeId
          ),
        },
      },
    };
  }

  if (msg.t === 'mouse-down') {
    const node = model.puzzle.nodes[msg.nodeId];
    if (node && isColored(node)) {
      return {
        model: {
          ...model,
          mouseStatus: 'down',
          activeColor: node.color,
          pathByColor: {
            ...model.pathByColor,
            [node.color]: addNodeToPath(
              model.pathByColor[node.color] ?? [],
              msg.nodeId
            ),
          },
        },
      };
    }
    return {
      model: {
        ...model,
        mouseStatus: 'down',
        activeColor: null,
      },
    };
  }

  if (msg.t === 'mouse-up') {
    return { model: { ...model, mouseStatus: 'up', activeColor: null } };
  }

  if (msg.t === 'mouse-leave') {
    return { model: { ...model, mouseStatus: 'up', activeColor: null } };
  }

  return { model };
};

export const View = ({
  model,
  $send,
}: {
  model: ViewModel;
  $send: (msg: ViewMsg) => void;
}) => {
  useLayoutEffect(() => {
    const canvas = document.getElementById('flow-canvas');

    if (!canvas) {
      return;
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.canvas.height = context.canvas.width;

    paint(context, model);
  });

  return (
    <canvas
      id="flow-canvas"
      style={{
        width: '100%',
        cursor: 'pointer',
      }}
      onMouseLeave={() => {
        $send({ t: 'mouse-leave' });
      }}
      onMouseDown={(event) => {
        event.stopPropagation();
        event.preventDefault();
        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'mouse', c: event });
        $send({ t: 'mouse-down', nodeId: id(pos) });
      }}
      onMouseUp={(event) => {
        event.stopPropagation();

        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'mouse', c: event });
        $send({ t: 'mouse-up', nodeId: id(pos) });
      }}
      onMouseMove={(event) => {
        event.stopPropagation();

        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'mouse', c: event });
        $send({ t: 'mouse-move', nodeId: id(pos) });
      }}
      onTouchMove={(event) => {
        event.stopPropagation();
        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'touch', c: event });
        $send({ t: 'mouse-move', nodeId: id(pos) });
      }}
      onTouchCancel={(event) => {
        event.stopPropagation();

        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'touch', c: event });
        $send({ t: 'mouse-up', nodeId: id(pos) });
      }}
      onTouchStart={(event) => {
        event.stopPropagation();

        const bounds = toBounds(model.puzzle);
        const pos = canvasEventToPosition(bounds, { t: 'touch', c: event });
        $send({ t: 'mouse-down', nodeId: id(pos) });
      }}
    />
  );
};
const canvasEventToPosition = (
  bounds: Bounds,
  event:
    | { t: 'mouse'; c: React.MouseEvent<HTMLCanvasElement, MouseEvent> }
    | { t: 'touch'; c: React.TouchEvent<HTMLCanvasElement> }
) => {
  const rect = event.c.currentTarget.getBoundingClientRect();
  let elementRelativeX: number;
  let elementRelativeY: number;
  if (event.t === 'mouse') {
    elementRelativeX = event.c.clientX - rect.left;
    elementRelativeY = event.c.clientY - rect.top;
  } else if (event.t === 'touch') {
    const touch = event.c.touches[0];
    if (!touch) {
      throw new Error('No touch');
    }
    elementRelativeX = touch.clientX - rect.left;
    elementRelativeY = touch.clientY - rect.top;
  } else {
    console.log(event);
    throw new Error('Unknown event');
  }
  const elementWidth = event.c.currentTarget.width;
  const elementHeight = event.c.currentTarget.height;
  const canvasRelativeX = (elementRelativeX * elementWidth) / rect.width;
  const canvasRelativeY = (elementRelativeY * elementHeight) / rect.height;

  const x = Math.floor(
    rescale({
      value: canvasRelativeX,
      from: [0, elementWidth],
      to: [bounds.min.x, bounds.max.x],
    })
  );
  const y = Math.floor(
    rescale({
      value: canvasRelativeY,
      from: [0, elementWidth],
      to: [bounds.min.y, bounds.max.y],
    })
  );
  return { x, y };
};

//
