import { cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import * as Flow from "../flow";
import * as FlowUI from "../flow-ui";
import * as FlowGrid from "./flow-grid";
import * as FlowGridPosition from "./flow-grid-position";

// const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_RADIUS = 0.33;
const EDGE_STROKE_WIDTH = 0.3;

let lastDraggedOver: Flow.NodeId | null = null;
/**
 * Renders the Flow Grid UI
 */
export const View = ({
  model,
  isDragging,
  onDraggedOver,
  onPressDown,
  onPressUp,
  isActive,
  class: className,
  autocompleteEdge,
  showCoordinates,
  disabled,
  onLeave,
}: {
  disabled?: boolean;
  class?: string;
  model: FlowGrid.Model;
  onPressDown?: (nodeId: Flow.NodeId) => void;
  onPressUp?: (nodeId: Flow.NodeId) => void;
  onLeave?: () => void;
  isDragging?: boolean;
  onDraggedOver?: (nodeId: Flow.NodeId) => void;
  autocompleteEdge?: (FlowGrid.Edge & { groupId: Flow.GroupId }) | null;
  showCoordinates?: boolean;
  isActive?: ({
    nodeId,
    groupId,
  }: {
    groupId: Flow.GroupId;
    nodeId: Flow.NodeId;
  }) => boolean;
}) => {
  const draggedOver = (nodeId: Flow.NodeId) => {
    if (!isDragging || lastDraggedOver === nodeId) {
      return;
    }
    lastDraggedOver = nodeId;
    onDraggedOver?.(nodeId);
  };
  const left = () => {
    if (!isDragging) {
      return;
    }
    lastDraggedOver = null;
    onLeave?.();
  };

  return (
    <svg
      class={cn(
        "w-full touch-none select-none",
        isDragging && "cursor-grabbing",
        disabled && "pointer-events-none",
        className
      )}
      onContextMenu={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      viewBox={toViewBox(model)}
      onTouchMove={(event) => {
        const nodeId = touchEventToNodeId(event);
        if (nodeId) {
          draggedOver?.(nodeId);
        }
      }}
      onMouseLeave={left}
    >
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
            : FlowUI.Color.toHex(FlowUI.GROUP_ID_TO_COLOR[groupId]);
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
        {map(FlowGrid.yieldTerminals(model), (terminal) => {
          return (
            <g key={terminal.groupId}>
              <ViewTerminalNode
                key={terminal.start.nodeId}
                groupId={terminal.groupId}
                x={terminal.start.x}
                y={terminal.start.y}
                isActive={Boolean(
                  isActive?.({
                    nodeId: terminal.start.nodeId,
                    groupId: terminal.groupId,
                  })
                )}
              />
              <ViewTerminalNode
                key={terminal.end.nodeId}
                groupId={terminal.groupId}
                x={terminal.end.x}
                y={terminal.end.y}
                isActive={Boolean(
                  isActive?.({
                    nodeId: terminal.end.nodeId,
                    groupId: terminal.groupId,
                  })
                )}
              />
            </g>
          );
        })}
      </g>

      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldPipes(model), (pipe) => {
          return (
            <g key={pipe.edgeId}>
              <line
                key={pipe.edgeId}
                x1={pipe.source.x}
                y1={pipe.source.y}
                x2={pipe.target.x}
                y2={pipe.target.y}
                stroke={FlowUI.Color.groupIdToHex(pipe.groupId)}
                stroke-width={EDGE_STROKE_WIDTH}
              />
              <circle
                cx={pipe.target.x}
                cy={pipe.target.y}
                r={0.14}
                fill={FlowUI.Color.groupIdToHex(pipe.groupId)}
              />
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

      {showCoordinates && (
        <g transform="translate(0, 1)">
          {map(FlowGrid.yieldNodes(model), (node) => {
            return (
              <text
                class="pointer-events-none"
                key={node.nodeId}
                x={node.x}
                y={node.y}
                style={{ fontSize: 0.2 }}
                fill="#fff"
              >
                {`${node.x},${node.y}`}
              </text>
            );
          })}
        </g>
      )}

      {/*


      Clickable


      */}
      <g>
        {map(FlowGrid.yieldNodes(model), (node) => {
          const nodeId = node.nodeId;
          const groupId = Flow.toGroupId(model.flow, node.nodeId);
          return (
            <rect
              key={node.nodeId}
              x={node.x}
              y={node.y}
              width={1}
              class={cn(
                isDragging
                  ? "cursor-grabbing"
                  : groupId
                  ? "cursor-pointer"
                  : null
              )}
              height={1}
              fill="transparent"
              onMouseDown={() => {
                onPressDown?.(nodeId);
              }}
              onMouseUp={() => {
                onPressUp?.(nodeId);
              }}
              onMouseEnter={() => {
                draggedOver?.(nodeId);
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
