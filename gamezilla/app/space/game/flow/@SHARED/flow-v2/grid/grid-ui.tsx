import { cn } from "gamezilla/app/@SHARED/ui";
import * as Flow from "../flow";
import * as FlowUI from "../flow-ui";
import * as FlowGrid from "./grid";
import * as FlowGridPosition from "./grid-position";

const TERMINAL_NODE_RADIUS = 0.33;
export const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;

const EDGE_STROKE_WIDTH = 0.3;

//
//
//
//

export type ViewModel = FlowGrid.Model;

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
  autocompleteEdge?: (FlowGrid.Edge & { groupId: Flow.GroupId }) | null;
  isActive?: ({
    nodeId,
    groupId,
  }: {
    groupId: Flow.GroupId;
    nodeId: Flow.NodeId;
  }) => boolean;
}) => {
  return (
    <svg
      className={cn("w-full touch-none select-none", className)}
      onContextMenu={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      viewBox={toViewBox(model)}
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
          const groupId = Flow.toGroupId(model.flow, node.nodeId);
          const fill = !groupId
            ? "transparent"
            : isActive?.({ nodeId: node.nodeId, groupId })
            ? "transparent"
            : FlowUI.Color.toHex(FlowUI.groupIdToColor[groupId]);
          return (
            <rect
              key={node.nodeId}
              x={node.x}
              y={node.y}
              width={1}
              height={1}
              fill={fill}
              fill-opacity={0.2}
            />
          );
        })}
      </g>

      {/*


      Grid lines


      */}
      <defs>
        <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="green"
            stroke-width="0.02"
          />
        </pattern>
      </defs>

      <rect
        x={model.bounds.min.x}
        y={model.bounds.min.y}
        width={model.bounds.max.x - model.bounds.min.x}
        height={model.bounds.max.y - model.bounds.min.y}
        fill="url(#grid)"
        stroke="green"
        stroke-width="0.02"
      />

      {/*


      Terminals


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldNodes(model), (node) => {
          switch (node.t) {
            case "empty": {
              return null;
            }
            case "path": {
              return null;
            }
            case "start": {
              return (
                <ViewTerminalNode
                  key={node.nodeId}
                  groupId={node.groupId}
                  x={node.x}
                  y={node.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: node.nodeId,
                      groupId: node.groupId,
                    })
                  )}
                />
              );
            }
            case "end": {
              return (
                <ViewTerminalNode
                  key={node.nodeId}
                  groupId={node.groupId}
                  x={node.x}
                  y={node.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: node.nodeId,
                      groupId: node.groupId,
                    })
                  )}
                />
              );
            }
          }
        })}
      </g>

      {/*


      Autocomplete edge


      */}
      <g transform="translate(0.5, 0.5)">
        {autocompleteEdge && (
          <line
            x1={autocompleteEdge.source.x}
            y1={autocompleteEdge.source.y}
            x2={autocompleteEdge.target.x}
            y2={autocompleteEdge.target.y}
            stroke={FlowUI.Color.groupIdToHex(autocompleteEdge.groupId)}
            stroke-width={EDGE_STROKE_WIDTH}
            strokeOpacity={0.5}
          />
        )}
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
              className="cursor-pointer"
              height={1}
              fill="transparent"
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
  groupId,
  x,
  y,
}: {
  groupId: Flow.GroupId;
  x: number;
  y: number;
  isActive: boolean;
}) => {
  return (
    <circle
      cx={x}
      cy={y}
      r={TERMINAL_NODE_RADIUS}
      fill={FlowUI.Color.groupIdToHex(groupId)}
    />
  );
};

const touchEventToNodeId = (event: TouchEvent): Flow.NodeId | null => {
  const touch = event.touches[0];
  if (!touch) {
    return null;
  }
  const svg = event.currentTarget;
  if (!(svg instanceof SVGSVGElement)) {
    return null;
  }
  const point = svg.createSVGPoint();
  point.x = touch.clientX;
  point.y = touch.clientY;
  const screenCTM = svg.getScreenCTM();
  if (!screenCTM) {
    return null;
  }
  const svgPosition = point.matrixTransform(screenCTM.inverse());
  const nodeId = FlowGrid.positionToNodeId({
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
