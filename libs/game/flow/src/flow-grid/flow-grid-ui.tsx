import { rescale } from '@gamezilla/shared/core';
import { cn } from '@gamezilla/shared/ui';
import { memo, useLayoutEffect, useRef } from 'react';
import { Flow } from '../flow';
import * as FlowGrid from './flow-grid';
import * as FlowGridPosition from './flow-grid-position';

//
//
//
// Model
//
//
//

export type Model = State & {
  grid: FlowGrid.Model;
};

type State = { t: 'idle' } | { t: 'dragging'; color: Flow.Color };

export const init = (grid: FlowGrid.Model): Model => ({
  t: 'idle',
  grid,
});

//
//
//
// Update
//
//
//

export type Msg =
  | { t: 'dragged-over'; nodeId: Flow.NodeId }
  | { t: 'pressed-down'; nodeId: Flow.NodeId }
  | { t: 'pressed-up'; nodeId: Flow.NodeId }
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
  return {
    model: updateModel({ msg, model }),
  };
};

export const updateModel = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): Model => {
  if (model.t === 'idle') {
    if (msg.t === 'pressed-down') {
      return updatePressedDown({ model, nodeId: msg.nodeId });
    }

    return model;
  }

  if (model.t === 'dragging') {
    if (msg.t === 'dragged-over') {
      const gridNew = Flow.extendPath(model.grid, model.color, msg.nodeId);

      return {
        ...model,
        grid: gridNew,
      };
    }

    if (msg.t === 'pressed-up') {
      return { ...model, t: 'idle' };
    }

    if (msg.t === 'pressed-down') {
      return updatePressedDown({ model, nodeId: msg.nodeId });
    }

    if (msg.t === 'mouse-leave') {
      return { ...model, t: 'idle' };
    }

    return model;
  }

  const check: never = model;

  return check;
};

const updatePressedDown = ({
  model,
  nodeId,
}: {
  nodeId: Flow.NodeId;
  model: Model;
}): Model => {
  const node = FlowGrid.toNode(model.grid, nodeId);

  if (!node) {
    return model;
  }

  if (Flow.isTerminal(node)) {
    return {
      ...model,
      grid: Flow.initPath(model.grid, node),
      t: 'dragging',
      color: node.color,
    };
  }

  return model;
};

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

    const nodeColor = Flow.toPathColor(grid, nodeId);

    if (!nodeColor) {
      continue;
    }

    if (model.t === 'dragging' && model.color === nodeColor) {
      continue;
    }

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = nodeColor;
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
    if (!edge.color) {
      continue;
    }

    //
    // Line
    //

    ctx.strokeStyle = edge.color;
    ctx.lineWidth = squareLength / 4;
    ctx.beginPath();
    ctx.moveTo(
      edge.from.x * squareLength + squareLength / 2,
      edge.from.y * squareLength + squareLength / 2
    );
    ctx.lineTo(
      edge.to.x * squareLength + squareLength / 2,
      edge.to.y * squareLength + squareLength / 2
    );
    ctx.stroke();
    ctx.closePath();

    //
    // Rounded Line Cap
    //

    ctx.beginPath();
    ctx.arc(
      edge.to.x * squareLength + squareLength / 2,
      edge.to.y * squareLength + squareLength / 2,
      squareLength / 8,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = edge.color;
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

//
//
//
//
//

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
  });

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
        onMouseDown={handleMouse({ model, $send, t: 'pressed-down' })}
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
        onTouchStart={handleTouch({ model, $send, t: 'pressed-down' })}
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
