import { cn } from "gamezilla-app/@CHILD/app/@SHARED/ui"
import { Flow, FlowUI } from "../../../flow"
import * as FlowGrid from "../flow-grid"

// const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_RADIUS = 0.33
const EDGE_STROKE_WIDTH = 0.3

let lastDraggedOver: Flow.NodeId | null = null
let isCurrentDeviceTouch = false

/**
 * Renders the Flow Grid UI
 */
const View = ({
  model,
  isDragging,
  className,
  autocompleteEdge,
  showCoordinates,
  disabled,
  onDraggedOver,
  onPressDown,
  onPressUp,
  isGroupActive,
  onLeave,
}: FlowUI.FlowViewProps<FlowGrid.Model>) => {
  const draggedOver = (nodeId: Flow.NodeId) => {
    if (!isDragging || lastDraggedOver === nodeId) {
      return
    }
    lastDraggedOver = nodeId
    onDraggedOver?.(nodeId)
  }

  const left = () => {
    if (!isDragging) {
      return
    }
    lastDraggedOver = null
    onLeave?.()
  }

  const onTouchMove = (e: TouchEvent) => {
    const nodeId = touchEventToNodeId(e)

    if (!nodeId) {
      return
    }

    draggedOver?.(nodeId)
  }

  return (
    <svg
      className={cn(
        "w-full touch-none select-none",
        isDragging && "cursor-grabbing",
        disabled && "pointer-events-none",
        className,
      )}
      onContextMenu={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      viewBox={`${0} ${0} ${model.width} ${model.height}`}
      onTouchMove={onTouchMove}
      onMouseLeave={left}
    >
      {/*


      Colored background tiles


      */}
      {/* <g>
        {map(FlowGrid.yieldNodes(model), (node) => {
          const groupId = Flow.toGroupId(model, node.nodeId)
          const fill = !groupId
            ? "transparent"
            : isActive?.({ nodeId: node.nodeId, groupId })
            ? "transparent"
            : FlowUI.Color.toHex(FlowUI.GROUP_ID_TO_COLOR[groupId])
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
          )
        })}
      </g> */}

      {/*


      Grid lines


      */}
      <defs>
        <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="green"
            strokeWidth="0.02"
          />
        </pattern>
      </defs>

      <rect
        x={0}
        y={0}
        width={model.width}
        height={model.height}
        fill="url(#grid)"
        stroke="green"
        strokeWidth="0.02"
      />

      {/*


      Terminals


      */}
      <g transform="translate(0.5, 0.5)">
        {map(FlowGrid.yieldTerminals(model), (terminal) => {
          const groupColor = FlowUI.Color.groupIdToHex(terminal.groupId)
          const pipeline = FlowGrid.yieldPipeline(model, terminal.startId)
          const pipelinePathData = pipelineToSvgPathData(pipeline)

          return (
            <g key={terminal.groupId}>
              <path
                d={isGroupActive(terminal.groupId) ? "" : pipelinePathData}
                stroke={groupColor}
                fill="none"
                strokeLinejoin="inherit"
                strokeLinecap="square"
                strokeWidth="1"
                strokeOpacity="0.2"
              />

              <circle
                cx={terminal.start.x}
                cy={terminal.start.y}
                r={TERMINAL_NODE_RADIUS}
                fill={groupColor}
              />

              <path
                d={pipelinePathData}
                stroke={groupColor}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={EDGE_STROKE_WIDTH}
              />

              {terminal.end && (
                <circle
                  cx={terminal.end.x}
                  cy={terminal.end.y}
                  r={TERMINAL_NODE_RADIUS}
                  fill={groupColor}
                />
              )}
            </g>
          )
        })}
      </g>

      {/*


      Autocomplete edge


      */}
      <g transform="translate(0.5, 0.5)">
        {autocompleteEdge && (
          <line
            x1={model.positions[autocompleteEdge.sourceId]?.x}
            y1={model.positions[autocompleteEdge.sourceId]?.y}
            x2={model.positions[autocompleteEdge.targetId]?.x}
            y2={model.positions[autocompleteEdge.targetId]?.y}
            stroke={FlowUI.Color.groupIdToHex(autocompleteEdge.groupId)}
            strokeWidth={EDGE_STROKE_WIDTH}
            strokeOpacity={0.5}
          />
        )}
      </g>

      {showCoordinates && (
        <g transform="translate(0, 1)">
          {map(FlowGrid.yieldNodes(model), (node) => {
            return (
              <text
                className="pointer-events-none"
                key={node.nodeId}
                x={node.x}
                y={node.y}
                fontSize="0.2"
                fill="#fff"
              >
                {`${node.x},${node.y}`}
              </text>
            )
          })}
        </g>
      )}

      {/*


      Clickable


      */}
      <g>
        {map(FlowGrid.yieldNodes(model), (node) => {
          return (
            <rect
              key={node.nodeId}
              x={node.x}
              y={node.y}
              width="1"
              height="1"
              fill="transparent"
              onMouseDown={() => {
                if (isCurrentDeviceTouch) {
                  return
                }
                onPressDown?.(node.nodeId)
              }}
              onMouseUp={() => {
                onPressUp?.(node.nodeId)
              }}
              onMouseEnter={() => {
                draggedOver?.(node.nodeId)
              }}
              onTouchStart={() => {
                isCurrentDeviceTouch = true
                onPressDown?.(node.nodeId)
              }}
              onTouchCancel={() => {
                isCurrentDeviceTouch = true
                onPressUp?.(node.nodeId)
              }}
              onTouchEnd={() => {
                isCurrentDeviceTouch = true
                onPressUp?.(node.nodeId)
              }}
            />
          )
        })}
      </g>
    </svg>
  )
}

const pipelineToSvgPathData = (
  pipeline: Iterable<FlowGrid.PipeJoined>,
): string => {
  let path = ""
  for (const pipe of pipeline) {
    path += `M ${pipe.source.x} ${pipe.source.y} L ${pipe.target.x} ${pipe.target.y} `
  }
  return path
}

const touchEventToNodeId = (msgSync: TouchEvent): Flow.NodeId | null => {
  const touch = msgSync.touches[0]
  if (!touch) {
    return null
  }
  const svg = msgSync.currentTarget
  if (!(svg instanceof SVGSVGElement)) {
    return null
  }
  const point = svg.createSVGPoint()
  point.x = touch.clientX
  point.y = touch.clientY
  const screenCTM = svg.getScreenCTM()
  if (!screenCTM) {
    return null
  }
  const svgPosition = point.matrixTransform(screenCTM.inverse())
  const nodeId = FlowGrid.positionToNodeId({
    x: Math.floor(svgPosition.x),
    y: Math.floor(svgPosition.y),
  })
  return nodeId
}

const map = <T, TY>(iterable: Iterable<T>, fn: (x: T) => TY): TY[] => {
  const result: TY[] = []

  for (const x of iterable) {
    result.push(fn(x))
  }

  return result
}

export const FlowGridUISvg = {
  View,
}
