import { easeAttrs } from "@gamezilla/core";
import { cn } from "@gamezilla/ui";
import { useEffect, useRef } from "react";
import { Color, Flow } from "../flow";
import { DraftTerminal, PathId } from "../flow/flow";
import { pathIdToColor } from "../flow/flow-color";
import * as FlowGrid from "./flow-grid";
import { Model } from "./flow-grid";
import * as FlowGridPosition from "./flow-grid-position";

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

export type ViewModel = Model & {
  draftTerminals: {
    [pathId in PathId]?: DraftTerminal;
  };
};

const yieldTerminals = function* (model: ViewModel): Generator<DraftTerminal> {
  for (const pathId in model.draftTerminals) {
    if (!Flow.isPathId(pathId)) {
      continue;
    }
    const terminal = model.draftTerminals[pathId];
    if (!terminal) {
      continue;
    }
    yield terminal;
  }
};

/**
 * Renders the Flow Grid UI
 */
export const View = ({
  model,
  onDraggedOver,
  onPressDown,
  onPressUp,
  isActive,
  className,
  autocompleteEdge,
}: {
  className?: string;
  //
  model: ViewModel;
  //
  onPressDown?: (nodeId: Flow.NodeId) => void;
  onPressUp?: (nodeId: Flow.NodeId) => void;
  onDraggedOver?: (nodeId: Flow.NodeId) => void;
  autocompleteEdge?: (FlowGrid.Edge & { pathId: Flow.PathId }) | null;
  isActive?: ({
    nodeId,
    pathId,
  }: {
    pathId: Flow.PathId;
    nodeId: Flow.NodeId;
  }) => boolean;
}) => {
  return (
    <svg
      className={cn("w-full touch-none select-none", className)}
      viewBox={toViewBox(model)}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
      onTouchMove={(event) => {
        const nodeId = touchEventToNodeId(event);
        if (nodeId) {
          onDraggedOver?.(nodeId);
        }
      }}>
      {/*


      Colored background tiles


      */}
      <g>
        {map(FlowGrid.yieldNodes(model), (node) => {
          const pathId = Flow.findPath(model, node.nodeId);
          const fill = !pathId
            ? "transparent"
            : isActive?.({ nodeId: node.nodeId, pathId })
            ? "transparent"
            : Color.toHex(pathIdToColor[pathId]);
          return (
            <rect
              key={node.nodeId}
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
          x={model.bounds.min.x}
          y={model.bounds.min.y}
          width={model.bounds.max.x - model.bounds.min.x}
          height={model.bounds.max.y - model.bounds.min.y}
          strokeWidth={0.02}
          fill="transparent"
        />
        {map(yieldRange(model.bounds.min.x + 1, model.bounds.max.x), (x) => {
          return (
            <line
              key={x}
              x1={x}
              y1={model.bounds.min.y}
              x2={x}
              y2={model.bounds.max.y}
            />
          );
        })}
        {map(yieldRange(model.bounds.min.y + 1, model.bounds.max.y), (y) => {
          return (
            <line
              key={y}
              x1={model.bounds.min.x}
              y1={y}
              x2={model.bounds.max.x}
              y2={y}
            />
          );
        })}
      </g>

      {/*


      Terminals


      */}
      <g transform="translate(0.5, 0.5)">
        {map(yieldTerminals(model), (terminal) => {
          const startId = terminal.startId;

          const startNode = FlowGrid.toNode(model, startId);
          const endNode = terminal.endId
            ? FlowGrid.toNode(model, terminal.endId)
            : null;

          return (
            <g key={`${terminal.pathId} ${terminal.startId} ${terminal.endId}`}>
              {startNode && (
                <ViewTerminalNode
                  pathId={terminal.pathId}
                  x={startNode.x}
                  y={startNode.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: startNode.nodeId,
                      pathId: terminal.pathId,
                    })
                  )}
                  key={startNode.nodeId}
                />
              )}
              {endNode && (
                <ViewTerminalNode
                  pathId={terminal.pathId}
                  x={endNode.x}
                  y={endNode.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: endNode.nodeId,
                      pathId: terminal.pathId,
                    })
                  )}
                  key={endNode.nodeId}
                />
              )}
            </g>
          );
        })}
      </g>

      {/*


      Autocomplete edge


      */}
      <g transform="translate(0.5, 0.5)">
        {autocompleteEdge && (
          <line
            x1={autocompleteEdge.nodeFrom.x}
            y1={autocompleteEdge.nodeFrom.y}
            x2={autocompleteEdge.nodeTo.x}
            y2={autocompleteEdge.nodeTo.y}
            stroke={Color.pathIdToHex(autocompleteEdge.pathId)}
            strokeWidth={EDGE_STROKE_WIDTH}
            strokeOpacity={0.5}
          />
        )}
      </g>

      {/*


      Edges


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldEdges(model), (edge) => {
          if (!edge.pathId) {
            return null;
          }
          return (
            <g key={Flow.toEdgeId(edge)}>
              <line
                x1={edge.nodeFrom.x}
                y1={edge.nodeFrom.y}
                x2={edge.nodeTo.x}
                y2={edge.nodeTo.y}
                stroke={Color.pathIdToHex(edge.pathId)}
                strokeWidth={EDGE_STROKE_WIDTH}
              />
              <circle
                cx={edge.nodeTo.x}
                cy={edge.nodeTo.y}
                r={EDGE_STROKE_WIDTH / 2}
                fill={Color.pathIdToHex(edge.pathId)}
              />
            </g>
          );
        })}
      </g>

      {/*


      Clickable


      */}
      <g>
        {map(FlowGrid.yieldNodes(model), (node) => {
          const nodeId = node.nodeId;

          return (
            <rect
              key={node.nodeId}
              x={node.x}
              y={node.y}
              width={1}
              height={1}
              fill={"transparent"}
              onMouseDown={() => {
                onPressDown?.(nodeId);
              }}
              onMouseUp={() => {
                onPressUp?.(nodeId);
              }}
              onMouseOver={() => {
                onDraggedOver?.(nodeId);
              }}
              onMouseMove={() => {
                onDraggedOver?.(nodeId);
              }}
              onTouchStart={() => {
                onPressDown?.(nodeId);
              }}
              onTouchCancel={() => {
                onPressUp?.(nodeId);
              }}
              onTouchEnd={() => {
                onPressUp?.(nodeId);
              }}
            />
          );
        })}
      </g>
    </svg>
  );
};

const ViewTerminalNode = ({
  pathId,
  x,
  y,
  isActive,
}: {
  pathId: PathId;
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
          easing: { type: "ease-out-back" },
        },
      });
      await easeAttrs(node, {
        r: {
          from: TERMINAL_NODE_RADIUS_ACTIVE,
          to: TERMINAL_NODE_RADIUS,
          duration: 400,
          easing: { type: "ease-out-back" },
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
      fill={Color.pathIdToHex(pathId)}
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
