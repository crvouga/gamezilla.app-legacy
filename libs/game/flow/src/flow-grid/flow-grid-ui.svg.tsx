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

const EDGE_STROKE_WIDTH = 0.3;

export const View = ({
  model,
  $send,
}: {
  model: Model;
  $send: (msg: Msg) => void;
}) => {
  const autocompleteEdge =
    model.t === 'dragging' && model.autocompleteEdge
      ? FlowGrid.toEdge(model.grid, Flow.toEdgeId(model.autocompleteEdge))
      : null;
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
      {/*


      Colored background tiles


      */}
      <g>
        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          const pathColor = Flow.toGroup(model.grid, node.id);
          const fill = !pathColor
            ? 'transparent'
            : model.t === 'dragging' && model.activeGroupId === pathColor
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
              fillOpacity={0.2}
            />
          );
        })}
      </g>

      {/*


      Grid lines


      */}
      <g stroke="green" strokeWidth={0.01}>
        <rect
          x={model.grid.bounds.min.x}
          y={model.grid.bounds.min.y}
          width={model.grid.bounds.max.x - model.grid.bounds.min.x}
          height={model.grid.bounds.max.y - model.grid.bounds.min.y}
          strokeWidth={0.02}
          fill="transparent"
        />
        {map(
          yieldRange(model.grid.bounds.min.x + 1, model.grid.bounds.max.x),
          (x) => {
            return (
              <line
                key={x}
                x1={x}
                y1={model.grid.bounds.min.y}
                x2={x}
                y2={model.grid.bounds.max.y}
              />
            );
          }
        )}
        {map(
          yieldRange(model.grid.bounds.min.y + 1, model.grid.bounds.max.y),
          (y) => {
            return (
              <line
                key={y}
                x1={model.grid.bounds.min.x}
                y1={y}
                x2={model.grid.bounds.max.x}
                y2={y}
              />
            );
          }
        )}
      </g>

      {/*


      Nodes


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldNodes(model.grid), (node) => {
          if (!Flow.isTerminal(node)) {
            return null;
          }

          return (
            <ViewTerminalNode
              color={node.groupId}
              x={node.x}
              y={node.y}
              isActive={
                model.t === 'dragging' && model.activeGroupId === node.groupId
              }
              key={node.id}
            />
          );
        })}
      </g>

      {/*


      Autocomplete edge


      */}
      <g transform="translate(0.5, 0.5)">
        {model.t === 'dragging' && autocompleteEdge && (
          <line
            x1={autocompleteEdge.nodeFrom.x}
            y1={autocompleteEdge.nodeFrom.y}
            x2={autocompleteEdge.nodeTo.x}
            y2={autocompleteEdge.nodeTo.y}
            stroke={Color.toHex(model.activeGroupId)}
            strokeWidth={EDGE_STROKE_WIDTH}
            strokeOpacity={0.5}
          />
        )}
      </g>

      {/*


      Edges


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldEdges(model.grid), (edge) => {
          if (!edge.groupId) {
            return null;
          }
          return (
            <g key={Flow.toEdgeId(edge)}>
              <line
                x1={edge.nodeFrom.x}
                y1={edge.nodeFrom.y}
                x2={edge.nodeTo.x}
                y2={edge.nodeTo.y}
                stroke={Color.toHex(edge.groupId)}
                strokeWidth={EDGE_STROKE_WIDTH}
              />
              <circle
                cx={edge.nodeTo.x}
                cy={edge.nodeTo.y}
                r={EDGE_STROKE_WIDTH / 2}
                fill={Color.toHex(edge.groupId)}
              />
            </g>
          );
        })}
      </g>

      {/*


      Clickable


      */}
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
  const isAnimating = useRef(false);
  useEffect(() => {
    if (previousIsActive.current === isActive) {
      return;
    }
    previousIsActive.current = isActive;

    const node = ref.current;
    if (!node) {
      return;
    }

    const animate = async () => {
      if (!isActive) {
        return;
      }

      if (isAnimating.current) {
        return;
      }
      isAnimating.current = true;

      await easeAttrs(node, {
        r: {
          from: TERMINAL_NODE_RADIUS,
          to: TERMINAL_NODE_RADIUS_ACTIVE,
          duration: 200,
          easing: { type: 'ease-out-back' },
        },
      });
      await easeAttrs(node, {
        r: {
          from: TERMINAL_NODE_RADIUS_ACTIVE,
          to: TERMINAL_NODE_RADIUS,
          duration: 400,
          easing: { type: 'ease-out-back' },
        },
      });
      isAnimating.current = false;
    };

    animate();
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

const yieldRange = function* (lower: number, upper: number) {
  for (let i = lower; i < upper; i++) {
    yield i;
  }
};
