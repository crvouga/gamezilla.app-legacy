import { rescale } from '@gamezilla/shared/core';
import { cn } from '@gamezilla/shared/ui';
import { useLayoutEffect, useRef } from 'react';
import { Color, Flow, groupIdToColor } from '../flow';
import * as FlowGrid from './flow-grid';
import * as FlowGridPosition from './flow-grid-position';
import { Model, Msg } from './flow-grid-ui';

//
//
//
// View
//
//
//

export const paint = (ctx: CanvasRenderingContext2D, model: Model) => {
  const { grid } = model;

  const squareLength =
    ctx.canvas.width / (grid.bounds.max.x - grid.bounds.min.x);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);

  //
  //  Grid
  //

  for (const position of FlowGrid.yieldPositions(grid)) {
    ctx.strokeStyle = '#676767';
    ctx.lineWidth = squareLength / 200;
    ctx.strokeRect(
      position.x * squareLength,
      position.y * squareLength,
      squareLength,
      squareLength
    );
  }

  for (const position of FlowGrid.yieldPositions(grid)) {
    const nodeId = FlowGrid.positionToId(position);

    const groupId = Flow.toGroup(grid, nodeId);

    if (!groupId) {
      continue;
    }

    // if (model.t === 'dragging' && model.color === nodeColor) {
    //   continue;
    // }

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = Color.toHex(groupIdToColor[groupId]);
    ctx.fillRect(
      position.x * squareLength,
      position.y * squareLength,
      squareLength,
      squareLength
    );
    ctx.globalAlpha = 1;
  }

  //
  // Colored Edges
  //

  for (const edge of FlowGrid.yieldEdges(grid)) {
    if (!edge.groupId) {
      continue;
    }

    //
    // Line
    //

    ctx.strokeStyle = Color.toHex(groupIdToColor[edge.groupId]);
    ctx.lineWidth = squareLength / 4;
    ctx.beginPath();
    ctx.moveTo(
      edge.nodeFrom.x * squareLength + squareLength / 2,
      edge.nodeFrom.y * squareLength + squareLength / 2
    );
    ctx.lineTo(
      edge.nodeTo.x * squareLength + squareLength / 2,
      edge.nodeTo.y * squareLength + squareLength / 2
    );
    ctx.stroke();
    ctx.closePath();

    //
    // Rounded Line Cap
    //

    ctx.beginPath();
    ctx.arc(
      edge.nodeTo.x * squareLength + squareLength / 2,
      edge.nodeTo.y * squareLength + squareLength / 2,
      squareLength / 8,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = Color.toHex(groupIdToColor[edge.groupId]);
    ctx.fill();
    ctx.closePath();
  }

  //
  // Nodes
  //
  for (const node of FlowGrid.yieldNodes(grid)) {
    if (!Flow.isTerminal(node)) {
      continue;
    }

    ctx.fillStyle = Color.toHex(groupIdToColor[node.groupId]);

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
    for (const node of FlowGrid.yieldPositions(grid)) {
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
  const renderCount = useRef(0);

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
    renderCount.current += 1;
  }, [model]);

  return (
    <>
      {renderCount.current}

      <canvas
        ref={canvasRef}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        className={cn(
          'select-none touch-none w-full',
          model.t === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onMouseLeave={handleMouse({ model, $send, t: 'mouse-leave' })}
        onMouseDown={handleMouse({ model, $send, t: 'pressed-down-node' })}
        onMouseUp={handleMouse({ model, $send, t: 'pressed-up' })}
        onMouseMove={
          model.t === 'dragging'
            ? handleMouse({ model, $send, t: 'dragged-over' })
            : undefined
        }
        onMouseEnter={
          model.t === 'dragging'
            ? handleMouse({ model, $send, t: 'dragged-over' })
            : undefined
        }
        //
        onTouchMove={
          model.t === 'dragging'
            ? handleTouch({ model, $send, t: 'dragged-over' })
            : undefined
        }
        //
        onTouchStart={handleTouch({ model, $send, t: 'pressed-down-node' })}
        //
        onTouchCancel={handleTouch({ model, $send, t: 'pressed-up' })}
        //
        onTouchEnd={handleTouch({ model, $send, t: 'pressed-up' })}
      />
    </>
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

    const position = canvasEventToPosition(model.grid.bounds, {
      t: 'mouse',
      c: event,
    });
    if (position) {
      $send({ t, nodeId: FlowGrid.positionToId(position) });
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

    const pos = canvasEventToPosition(model.grid.bounds, {
      t: 'touch',
      c: event,
    });
    if (pos) {
      $send({ t, nodeId: FlowGrid.positionToId(pos) });
    }
  };

const canvasEventToPosition = (
  bounds: FlowGridPosition.Bounds,
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
  bounds: FlowGridPosition.Bounds,
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
