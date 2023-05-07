import { rescale } from '@gamezilla/shared/core';
import { cn } from '@gamezilla/shared/ui';
import { useLayoutEffect, useRef } from 'react';
import {
  Bounds,
  Path,
  Puzzle,
  addNodeToPath,
  id,
  isColored,
  yieldColoredNodes,
  yieldNodes,
} from './flow';

//
//
//
// Model
//
//
//

export type Model = {
  puzzle: Puzzle;
  pathByColor: { [color: string]: Path };
  mouseStatus: 'up' | 'down';
  activeColor?: string | null;
};

export const init = (puzzle: Puzzle): Model => ({
  puzzle,
  pathByColor: {},
  mouseStatus: 'up',
});

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'mouse-move'; nodeId: string }
  | { t: 'mouse-down'; nodeId: string }
  | { t: 'mouse-up'; nodeId: string }
  | { t: 'mouse-leave' };

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
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

//
//
//
// View
//
//
//

export const paint = (
  ctx: CanvasRenderingContext2D,
  { puzzle, pathByColor }: Model
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

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
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
    model: Model;
    t: Msg['t'];
    $send: (m: Msg) => void;
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
    model: Model;
    t: Msg['t'];
    $send: (m: Msg) => void;
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

export const canvasEventToRealPosition = (
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

  const x = rescale({
    value: canvasRelativeX,
    from: [0, elementWidth],
    to: [bounds.min.x, bounds.max.x],
  });

  const y = rescale({
    value: canvasRelativeY,
    from: [0, elementWidth],
    to: [bounds.min.y, bounds.max.y],
  });

  return { x, y };
};

//
//
// Cover Art
//
//

const board = [
  ['b', 'r', 'r', 'r', 'o'],
  ['b', 'r', 'y', 'y', 'o'],
  ['b', 'r', 'y', 'o', 'o'],
  ['b', 'r', 'o', 'o', 'g'],
  ['b', 'b', 'g', 'g', 'g'],
] as const;

const letterToColor = (letter: 'b' | 'r' | 'o' | 'g' | 'y'): string => {
  switch (letter) {
    case 'b':
      return 'blue';
    case 'r':
      return 'red';
    case 'o':
      return 'orange';
    case 'g':
      return 'green';
    case 'y':
      return 'yellow';
  }
};

export const viewCoverArt = () => {
  return (
    <svg width="100%" className="border border-gray-700" viewBox="0 0 5 5">
      <rect width="100%" height="100%" fill="black" />
      {board.map((row, y) =>
        row.map((letter, x) => {
          const fill = letterToColor(letter);

          const isNorth = board[y - 1]?.[x] === letter;
          const isSouth = board[y + 1]?.[x] === letter;
          const isEast = board[y]?.[x + 1] === letter;
          const isWest = board[y]?.[x - 1] === letter;

          const isEndpoint =
            [isNorth, isSouth, isEast, isWest].filter((flag) => flag).length ===
            1;

          return (
            <g
              key={`${x}-${y}-${fill}`}
              transform="translate(0.5, 0.5)"
              strokeWidth={0.3}
            >
              <circle cx={x} cy={y} r={isEndpoint ? 0.3 : 0.15} fill={fill} />
              {isNorth && (
                <line x1={x} y1={y} x2={x} y2={y - 0.6} stroke={fill} />
              )}
              {isSouth && (
                <line x1={x} y1={y} x2={x} y2={y + 0.6} stroke={fill} />
              )}
              {isWest && (
                <line x1={x} y1={y} x2={x - 0.6} y2={y} stroke={fill} />
              )}
              {isEast && (
                <line x1={x} y1={y} x2={x + 0.6} y2={y} stroke={fill} />
              )}
            </g>
          );
        })
      )}
    </svg>
  );
};
