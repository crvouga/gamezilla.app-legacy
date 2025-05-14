import type { VDom } from '~/@/vdom/vdom'
import { IconCheckmark } from '~/@/ui/icon/icon-checkmark'
import { cn } from '~/@/ui/cn'
import { Flow } from '../../../flow'
import { NodeId } from '../../../flow/node-id'
import { BoardInput } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { Color } from '../../../ui/color'

// const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_RADIUS = 0.33
const EDGE_STROKE_WIDTH = 0.3

let lastDraggedOver: NodeId | null = null

const View = (input: BoardInput<VariantGrid.Model>) => {
  const draggedOver = (nodeId: NodeId) => {
    if (!input.isDragging || lastDraggedOver === nodeId) {
      return
    }
    lastDraggedOver = nodeId
    input.onDraggedOver?.(nodeId)
  }

  const left = () => {
    if (!input.isDragging) {
      return
    }
    lastDraggedOver = null
    input.onLeave?.()
  }

  const onTouchMove = (e: unknown) => {
    const nodeId = touchEventToNodeId(e)

    if (!nodeId) return

    draggedOver?.(nodeId)
  }

  return (
    <svg
      className={cn(
        'aspect-square h-full max-h-full w-full touch-none overflow-hidden select-none',
        input.isDragging && 'cursor-grabbing',
        input.disabled && 'pointer-events-none',
        input.className,
      )}
      onContextMenu={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      viewBox={`${0} ${0} ${input.model.width} ${input.model.height}`}
      onTouchMove={onTouchMove}
      onMouseLeave={left}
      onMouseUp={left}
    >
      <title>Flow Grid</title>
      <ViewGrid {...input} />

      <ViewPipelines {...input} />

      <ViewAutocompleteEdge {...input} />

      <ViewCoordinates {...input} />

      {!input.disabled && <ViewClickable {...input} draggedOver={draggedOver} />}
    </svg>
  )
}

const ViewGrid = (input: BoardInput<VariantGrid.Model>) => {
  return (
    <>
      <defs>
        <pattern id='grid' width='1' height='1' patternUnits='userSpaceOnUse'>
          <path d='M 1 0 L 0 0 0 1' fill='none' stroke='green' strokeWidth='0.02' />
        </pattern>
      </defs>

      <rect
        x={0}
        y={0}
        width={input.model.width}
        height={input.model.height}
        fill='url(#grid)'
        stroke={input.borderless ? 'black' : 'green'}
        strokeWidth='0.02'
      />
    </>
  )
}

const ViewPipelines = (input: BoardInput<VariantGrid.Model>) => {
  return (
    <g transform='translate(0.5, 0.5)'>
      {map(VariantGrid.yieldTerminals(input.model), (terminal) => {
        return <ViewPipeline key={terminal.groupId} {...input} terminal={terminal} />
      })}
    </g>
  )
}

const ViewPipeline = (
  input: BoardInput<VariantGrid.Model> & {
    terminal: VariantGrid.GridTerminal
  },
) => {
  const terminal = input.terminal
  const groupColor = Color.groupIdToHex(terminal.groupId)
  const pipeline = VariantGrid.toPipeline(input.model, terminal.startId)
  const pipelinePathData = pipelineToSvgPathData(pipeline)
  const didUseHint = Boolean(input.usedHints?.[terminal.groupId])
  const isConnectedWithPipes = Flow.isTerminalConnectedWithPipes(input.model, terminal.groupId)
  const shouldShowUsedHint = isConnectedWithPipes && didUseHint

  return (
    <g key={terminal.groupId} id={terminal.groupId}>
      {!input.disableHighlight && (
        <path
          d={input.isGroupActive?.(terminal.groupId) ? '' : pipelinePathData}
          stroke={groupColor}
          fill='none'
          strokeLinejoin='inherit'
          strokeLinecap='square'
          strokeWidth='1'
          strokeOpacity='0.2'
        />
      )}

      <path
        d={pipelinePathData}
        stroke={groupColor}
        fill='none'
        strokeLinejoin='round'
        strokeLinecap='round'
        strokeWidth={EDGE_STROKE_WIDTH}
      />

      <circle cx={terminal.start.x} cy={terminal.start.y} r={TERMINAL_NODE_RADIUS} fill={groupColor} />

      {shouldShowUsedHint && <HintCheckmark x={terminal.start.x} y={terminal.start.y} />}

      {terminal.end && (
        <>
          <circle cx={terminal.end.x} cy={terminal.end.y} r={TERMINAL_NODE_RADIUS} fill={groupColor} />
          {shouldShowUsedHint && <HintCheckmark x={terminal.end.x} y={terminal.end.y} />}
        </>
      )}
    </g>
  )
}

const HintCheckmark = (input: { x: number; y: number }) => {
  return (
    <WithPadding
      x={input.x - 0.5}
      y={input.y - 0.5}
      width={1}
      height={1}
      padding={0.25}
      render={(input) => <IconCheckmark {...input} />}
    />
  )
}

const WithPadding = (input: {
  x: number
  y: number
  width: number
  height: number
  padding: number
  render: (input: { x: number; y: number; width: number; height: number }) => VDom
}) => {
  const { x, y, width, height, padding, render } = input

  const paddedWidth = Math.max(0, width - padding * 2)
  const paddedHeight = Math.max(0, height - padding * 2)
  const paddedX = x + padding
  const paddedY = y + padding

  return render({
    x: paddedX,
    y: paddedY,
    width: paddedWidth,
    height: paddedHeight,
  })
}

const ViewAutocompleteEdge = (input: BoardInput<VariantGrid.Model>) => {
  return (
    input.autocompleteEdge && (
      <g transform='translate(0.5, 0.5)'>
        <line
          x1={input.model.positions[input.autocompleteEdge.sourceId]?.x}
          y1={input.model.positions[input.autocompleteEdge.sourceId]?.y}
          x2={input.model.positions[input.autocompleteEdge.targetId]?.x}
          y2={input.model.positions[input.autocompleteEdge.targetId]?.y}
          stroke={Color.groupIdToHex(input.autocompleteEdge.groupId)}
          strokeWidth={EDGE_STROKE_WIDTH}
          strokeOpacity={0.5}
        />
      </g>
    )
  )
}

const ViewCoordinates = (input: BoardInput<VariantGrid.Model>) => {
  return (
    input.showCoordinates && (
      <g transform='translate(0, 1)'>
        {map(VariantGrid.yieldNodes(input.model), (node) => {
          return (
            <text className='pointer-events-none' key={node.nodeId} x={node.x} y={node.y} fontSize='0.2' fill='#fff'>
              {`${node.x},${node.y}`}
            </text>
          )
        })}
      </g>
    )
  )
}

const ViewClickable = (
  input: BoardInput<VariantGrid.Model> & {
    draggedOver?: (nodeId: NodeId) => void
  },
) => {
  return (
    <g key={input.model.nodeHash}>
      {map(VariantGrid.yieldNodes(input.model), (node) => {
        return (
          <ViewClickableNode
            key={node.nodeId}
            node={node}
            onPressDown={input.onPressDown}
            onPressUp={input.onPressUp}
            draggedOver={input.draggedOver}
          />
        )
      })}
    </g>
  )
}

const ViewClickableNode = (
  input: Pick<BoardInput<VariantGrid.Model>, 'onPressDown' | 'onPressUp'> & {
    node: VariantGrid.Node
    draggedOver?: (nodeId: NodeId) => void
  },
) => {
  return (
    <rect
      key={input.node.nodeId}
      x={input.node.x}
      y={input.node.y}
      width='1'
      height='1'
      fill='transparent'
      onPointerDown={() => {
        input.onPressDown?.(input.node.nodeId)
      }}
      onPointerUp={() => {
        input.onPressUp?.(input.node.nodeId)
      }}
      onPointerEnter={() => {
        input.draggedOver?.(input.node.nodeId)
      }}
    />
  )
}

const pipelineToSvgPathData = (pipeline: Iterable<VariantGrid.PipeJoined>): string => {
  let path = ''
  for (const pipe of pipeline) {
    path += `M ${pipe.source.x} ${pipe.source.y} L ${pipe.target.x} ${pipe.target.y} `
  }
  return path
}

const touchEventToNodeId = (e: unknown): NodeId | null => {
  if (typeof e !== 'object') {
    return null
  }

  if (!e) {
    return null
  }

  if (!('touches' in e && e.touches instanceof TouchList)) {
    return null
  }

  if (!('currentTarget' in e)) {
    return null
  }

  const touch = e.touches[0]

  if (!touch) {
    return null
  }
  const svg = e.currentTarget
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
  const nodeId = VariantGrid.toNodeId({
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

export const VariantGridBoardSvg = {
  View,
}
