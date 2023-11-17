import { cn } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Flow } from "..";
import { Color, groupIdToColor } from "../flow-ui";
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
export const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;

const EDGE_STROKE_WIDTH = 0.3;

//
//
//
//

type DraftTerminal = {
  groupId: Flow.GroupId;
  startId: Flow.NodeId;
  endId: Flow.NodeId | null;
};

export type ViewModel = Model & {
  draftTerminals: {
    [groupId in Flow.GroupId]?: DraftTerminal;
  };
};

const yieldTerminals = function* (model: ViewModel): Generator<DraftTerminal> {
  for (const groupId in model.draftTerminals) {
    if (!Flow.isGroupId(groupId)) {
      continue;
    }
    const terminal = model.draftTerminals[groupId];
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
  class: className,
  autocompleteEdge,
}: {
  class?: string;
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
      class={cn("w-full touch-none select-none", className)}
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
          const groupId = Flow.findGroup(model, node.nodeId);
          const fill = !groupId
            ? "transparent"
            : isActive?.({ nodeId: node.nodeId, groupId })
            ? "transparent"
            : Color.toHex(groupIdToColor[groupId]);
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
        {map(yieldTerminals(model), (terminal) => {
          const startId = terminal.startId;

          const startNode = FlowGrid.toNode(model, startId);
          const endNode = terminal.endId
            ? FlowGrid.toNode(model, terminal.endId)
            : null;

          return (
            <g
              key={`${terminal.groupId} ${terminal.startId} ${terminal.endId}`}>
              {startNode && (
                <ViewTerminalNode
                  groupId={terminal.groupId}
                  x={startNode.x}
                  y={startNode.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: startNode.nodeId,
                      groupId: terminal.groupId,
                    })
                  )}
                  key={startNode.nodeId}
                />
              )}
              {endNode && (
                <ViewTerminalNode
                  groupId={terminal.groupId}
                  x={endNode.x}
                  y={endNode.y}
                  isActive={Boolean(
                    isActive?.({
                      nodeId: endNode.nodeId,
                      groupId: terminal.groupId,
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
            stroke={Color.groupIdToHex(autocompleteEdge.groupId)}
            stroke-width={EDGE_STROKE_WIDTH}
            strokeOpacity={0.5}
          />
        )}
      </g>

      {/*


      Edges


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldEdges(model), (edge) => {
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
                stroke={Color.groupIdToHex(edge.groupId)}
                stroke-width={EDGE_STROKE_WIDTH}
              />
              <circle
                cx={edge.nodeTo.x}
                cy={edge.nodeTo.y}
                r={EDGE_STROKE_WIDTH / 2}
                fill={Color.groupIdToHex(edge.groupId)}
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
              class="cursor-pointer"
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
      fill={Color.groupIdToHex(groupId)}
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
