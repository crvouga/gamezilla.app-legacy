import { easeAttrs } from '@gamezilla/shared/core';
import { cn } from '@gamezilla/shared/ui';
import { useEffect, useRef } from 'react';
import { Color, Flow } from '../flow';
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

const TERMINAL_NODE_RADIUS = 0.33;
const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_ACTIVE_ANIMATION_DURATION = 200;
const EDGE_STROKE_WIDTH = 0.3;

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  return (
    <svg
      className={cn(
        'select-none touch-none w-full',
        model.t === 'dragging' ? 'cursor-grabbing' : 'cursor-grab'
      )}
      viewBox={toViewBox(model.grid)}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onTouchMove={(event) => {
        const nodeId = touchEventToNodeId(event);
        if (nodeId) {
          $send({ t: 'dragged-over', nodeId });
        }
      }}
    >
      <g>
        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          const pathColor = Flow.toPathColor(model.grid, node.id);

          const fill = !pathColor
            ? 'transparent'
            : model.t === 'dragging' && model.color === pathColor
            ? 'transparent'
            : Color.toHex(pathColor);
          return (
            <rect
              key={node.id}
              x={node.x}
              y={node.y}
              width={1}
              height={1}
              fill={fill}
              fillOpacity={0.3}
              stroke="green"
              strokeWidth={0.003}
            />
          );
        })}
      </g>

      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          if (!Flow.isTerminal(node)) {
            return null;
          }

          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={TERMINAL_NODE_RADIUS}
              fill={Color.toHex(node.color)}
              onClick={() => {
                $send({ t: 'pressed-down', nodeId: node.id });
              }}
            />
          );
        })}

        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          if (!Flow.isTerminal(node)) {
            return null;
          }

          return (
            <ViewTerminalNode
              color={node.color}
              x={node.x}
              y={node.y}
              isActive={model.t === 'dragging' && model.color === node.color}
              key={node.id}
            />
          );
        })}

        {map(FlowGrid.yieldEdges(model.grid), (edge) => {
          if (!edge.color) {
            return null;
          }
          return (
            <g key={Flow.toEdgeId(edge)}>
              <line
                x1={edge.nodeFrom.x}
                y1={edge.nodeFrom.y}
                x2={edge.nodeTo.x}
                y2={edge.nodeTo.y}
                stroke={Color.toHex(edge.color)}
                strokeWidth={EDGE_STROKE_WIDTH}
              />
              <circle
                cx={edge.nodeTo.x}
                cy={edge.nodeTo.y}
                r={EDGE_STROKE_WIDTH / 2}
                fill={Color.toHex(edge.color)}
              />
            </g>
          );
        })}
      </g>

      <g>
        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          const nodeId = node.id;
          return (
            <rect
              key={node.id}
              x={node.x}
              y={node.y}
              width={1}
              height={1}
              fill={'transparent'}
              onMouseDown={() => {
                $send({ t: 'pressed-down', nodeId });
              }}
              onMouseUp={() => {
                $send({ t: 'pressed-up', nodeId });
              }}
              onMouseOver={() => {
                $send({ t: 'dragged-over', nodeId });
              }}
              onMouseMove={() => {
                $send({ t: 'dragged-over', nodeId: node.id });
              }}
              onTouchStart={() => {
                $send({ t: 'pressed-down', nodeId });
              }}
              onTouchCancel={() => {
                $send({ t: 'pressed-up', nodeId });
              }}
              onTouchEnd={() => {
                $send({ t: 'pressed-up', nodeId });
              }}
            />
          );
        })}
      </g>
    </svg>
  );
};

const ViewTerminalNode = ({
  color,
  x,
  y,
  isActive,
}: {
  color: Color;
  x: number;
  y: number;
  isActive: boolean;
}) => {
  const ref = useRef<SVGCircleElement | null>(null);
  const previousIsActive = useRef(isActive);
  useEffect(() => {
    if (previousIsActive.current === isActive) {
      return;
    }
    previousIsActive.current = isActive;

    const node = ref.current;

    if (!node) {
      return;
    }

    if (isActive) {
      easeAttrs(node, {
        r: {
          from: TERMINAL_NODE_RADIUS,
          to: TERMINAL_NODE_RADIUS_ACTIVE,
          duration: TERMINAL_NODE_ACTIVE_ANIMATION_DURATION,
          easing: { type: 'ease-out-back' },
        },
      });
      return;
    }

    easeAttrs(node, {
      r: {
        from: TERMINAL_NODE_RADIUS_ACTIVE,
        to: TERMINAL_NODE_RADIUS,
        duration: TERMINAL_NODE_ACTIVE_ANIMATION_DURATION,
        easing: { type: 'ease-out-back' },
      },
    });
  }, [isActive]);

  return (
    <circle
      ref={ref}
      cx={x}
      cy={y}
      r={TERMINAL_NODE_RADIUS}
      fill={Color.toHex(color)}
    />
  );
};

const touchEventToNodeId = (
  event: React.TouchEvent<SVGSVGElement>
): Flow.NodeId | null => {
  const touch = event.touches[0];
  if (!touch) {
    return null;
  }
  const svg = event.currentTarget;
  const point = svg.createSVGPoint();
  point.x = touch.clientX;
  point.y = touch.clientY;
  const screenCTM = svg.getScreenCTM();
  if (!screenCTM) {
    return null;
  }
  const svgPosition = point.matrixTransform(screenCTM.inverse());
  const nodeId = FlowGrid.positionToId({
    x: Math.floor(svgPosition.x),
    y: Math.floor(svgPosition.y),
  });
  return nodeId;
};

const toViewBox = ({ bounds }: { bounds: FlowGridPosition.Bounds }) => {
  const width = bounds.max.x - bounds.min.x;
  const height = bounds.max.y - bounds.min.y;

  return `${bounds.min.x} ${bounds.min.y} ${width} ${height}`;
};

const map = <T, TY>(iterable: Iterable<T>, fn: (x: T) => TY): TY[] => {
  const result: TY[] = [];

  for (const x of iterable) {
    result.push(fn(x));
  }

  return result;
};
