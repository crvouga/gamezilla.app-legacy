import { Err, NonEmpty, Ok, Result, rescale } from '@gamezilla/core';
import { cn } from '@gamezilla/shared/ui';
import { useLayoutEffect, useRef } from 'react';

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
  const squareLength =
    ctx.canvas.width / (puzzle.bounds.max.x - puzzle.bounds.min.x);

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);

  //
  //  Grid
  //

  for (let x = 0; x < puzzle.bounds.max.x; x++) {
    for (let y = 0; y < puzzle.bounds.max.y; y++) {
      ctx.strokeStyle = '#676767';
      ctx.strokeRect(
        x * squareLength,
        y * squareLength,
        squareLength,
        squareLength
      );
    }
  }

  //
  // Paths
  //
  for (const color in pathByColor) {
    const path = pathByColor[color];

    if (!path) {
      continue;
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = squareLength / 4;
    ctx.beginPath();

    for (let nodeIndex = 0; nodeIndex < path.length - 1; nodeIndex++) {
      const nodeId = path[nodeIndex];

      if (!nodeId) {
        continue;
      }

      const node = puzzle.nodes[nodeId];

      if (!node) {
        continue;
      }

      const nextNodeId = path[nodeIndex + 1];

      if (!nextNodeId) {
        continue;
      }

      const nextNode = puzzle.nodes[nextNodeId];

      if (!nextNode) {
        continue;
      }

      ctx.moveTo(
        node.x * squareLength + squareLength / 2,
        node.y * squareLength + squareLength / 2
      );
      ctx.lineTo(
        nextNode.x * squareLength + squareLength / 2,
        nextNode.y * squareLength + squareLength / 2
      );
    }
    ctx.stroke();
    ctx.closePath();
  }

  //
  // Path round corners
  //
  for (const color in pathByColor) {
    const path = pathByColor[color];

    if (!path) {
      continue;
    }

    ctx.fillStyle = color;
    ctx.beginPath();

    for (let nodeIndex = 0; nodeIndex < path.length - 1; nodeIndex++) {
      const nodeId = path[nodeIndex];

      if (!nodeId) {
        continue;
      }

      const node = puzzle.nodes[nodeId];

      if (!node) {
        continue;
      }

      const nextNodeId = path[nodeIndex + 1];

      if (!nextNodeId) {
        continue;
      }

      const nextNode = puzzle.nodes[nextNodeId];

      if (!nextNode) {
        continue;
      }

      const previousNodeId = path[nodeIndex - 1];

      if (!previousNodeId) {
        continue;
      }

      const previousNode = puzzle.nodes[previousNodeId];

      if (!previousNode) {
        continue;
      }

      const didChangeX = node.x - previousNode.x !== node.x - nextNode.x;
      const didChangeY = node.y - previousNode.y !== node.y - nextNode.y;
      if (didChangeX || didChangeY) {
        ctx.arc(
          node.x * squareLength + squareLength / 2,
          node.y * squareLength + squareLength / 2,
          squareLength / 9,
          0,
          2 * Math.PI
        );
      }
      ctx.fill();
      ctx.closePath();
    }
  }

  //
  // Nodes
  //
  for (const node of yieldColoredNodes(puzzle)) {
    ctx.fillStyle = node.color;

    ctx.beginPath();
    ctx.arc(
      node.x * squareLength + squareLength / 2,
      node.y * squareLength + squareLength / 2,
      squareLength / 3,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.closePath();
  }

  //
  // Debug
  //

  const showPositions = false;
  if (showPositions) {
    for (const node of yieldNodes(puzzle)) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        `x: ${node.x}, y: ${node.y}`,
        node.x * squareLength,
        node.y * squareLength
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    canvas.height = canvas.width;

    paint(context, model);
  });

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'select-none touch-none w-full',
        model.mouseStatus === 'up' ? 'cursor-grab' : 'cursor-grabbing'
      )}
      onMouseLeave={handleMouse({ model, $send, t: 'mouse-leave' })}
      onMouseDown={handleMouse({ model, $send, t: 'mouse-down' })}
      onMouseUp={handleMouse({ model, $send, t: 'mouse-up' })}
      onMouseMove={handleMouse({ model, $send, t: 'mouse-move' })}
      onTouchMove={handleTouch({ model, $send, t: 'mouse-move' })}
      onTouchStart={handleTouch({ model, $send, t: 'mouse-down' })}
      onTouchCancel={handleTouch({ model, $send, t: 'mouse-up' })}
      onTouchEnd={handleTouch({ model, $send, t: 'mouse-up' })}
    />
  );
};

const handleMouse =
  ({
    model,
    t,
    $send,
  }: {
    model: ViewModel;
    t: ViewMsg['t'];
    $send: (m: ViewMsg) => void;
  }) =>
  (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.stopPropagation();

    const pos = canvasEventToPosition(model.puzzle.bounds, {
      t: 'mouse',
      c: event,
    });
    if (pos) {
      $send({ t, nodeId: id(pos) });
    }
  };

const handleTouch =
  ({
    model,
    t,
    $send,
  }: {
    model: ViewModel;
    t: ViewMsg['t'];
    $send: (m: ViewMsg) => void;
  }) =>
  (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.stopPropagation();

    const pos = canvasEventToPosition(model.puzzle.bounds, {
      t: 'touch',
      c: event,
    });
    if (pos) {
      $send({ t, nodeId: id(pos) });
    }
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
      return null;
    }
    elementRelativeX = touch.clientX - rect.left;
    elementRelativeY = touch.clientY - rect.top;
  } else {
    return null;
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

//
//
//
// Shorthand
//
//
//

type Shorthand = NonEmpty<NonEmpty<string | null>>;

const emojiToColor = (emoji: string): Color | null => {
  return (
    { '🟡': 'yellow', '🔵': 'blue', '🟢': 'green', '🔴': 'red' }[emoji] ?? null
  );
};

export const fromShorthand = (puzzle: Shorthand) => {
  let grid = initGrid({
    bounds: {
      min: {
        x: 0,
        y: 0,
      },
      max: {
        x: puzzle[0].length,
        y: puzzle.length,
      },
    },
  });

  for (let y = 0; y < puzzle.length; y++) {
    const row = puzzle[y];
    if (!row) {
      continue;
    }
    for (let x = 0; x < row.length; x++) {
      const emoji = row[x];
      if (!emoji) {
        continue;
      }
      const color = emojiToColor(emoji);
      if (!color) {
        continue;
      }

      grid = setNode(grid, {
        x,
        y,
        color,
      });
    }
  }

  return grid;
};

export const puzzles = {
  '5x5': fromShorthand([
    [null, '🟡', '🔵', null, null],
    [null, '🟢', null, null, null],
    [null, '🟡', '🔴', null, null],
    ['🟢', '🔴', null, null, null],
    [null, null, null, null, '🔵'],
  ]),
};
