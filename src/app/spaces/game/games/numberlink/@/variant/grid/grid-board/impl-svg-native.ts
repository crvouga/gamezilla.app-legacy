import { cn } from '~/@/ui/cn'
import { IconCheckmark } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { Circle } from '~/@/vdom/primitives/svg/circle'
import { Defs } from '~/@/vdom/primitives/svg/defs'
import { G } from '~/@/vdom/primitives/svg/g'
import { Line } from '~/@/vdom/primitives/svg/line'
import { Path } from '~/@/vdom/primitives/svg/path'
import { Pattern } from '~/@/vdom/primitives/svg/pattern'
import { Rect } from '~/@/vdom/primitives/svg/rect'
import { Svg } from '~/@/vdom/primitives/svg/svg'
import { SvgText } from '~/@/vdom/primitives/svg/text'
import type { VDom } from '~/@/vdom/vdom'
import { Numberlink } from '../../../numberlink'
import { BoardInput } from '../../../ui/board'
import { Color } from '../../../ui/color'
import * as VariantGrid from '../grid'
import { rescale } from '~/@/math/rescale'
import { NodeId } from '../../../numberlink/node-id'

// const TERMINAL_NODE_RADIUS_ACTIVE = 0.4;
const TERMINAL_NODE_RADIUS = 0.33
const EDGE_STROKE_WIDTH = 0.3

let layoutWidth = 0
let layoutHeight = 0
let lastDraggedOverNodeId: NodeId | null = null

const View = (input: BoardInput<VariantGrid.Model>) => {
  return h(
    Svg,
    {
      class: cn(
        'aspect-square w-full touch-none overflow-hidden select-none',
        input.isDragging && 'cursor-grabbing',
        input.disabled && 'pointer-events-none',
        input.class,
      ),
      viewBox: `${0} ${0} ${input.model.width} ${input.model.height}`,
      onLayout: (e) => {
        // @ts-ignore
        layoutWidth = e.nativeEvent.layout.width
        // @ts-ignore
        layoutHeight = e.nativeEvent.layout.height
        console.log('\n\n\nonLayout\n\n\n')
        console.log({ layoutWidth, layoutHeight })
        console.log('\n\n\n')
      },
      onPressIn: (e: any) => {
        const x = e.nativeEvent?.locationX
        const y = e.nativeEvent?.locationY
        const x_ = Math.floor(rescale(x, 0, layoutWidth, 0, input.model.width))
        const y_ = Math.floor(rescale(y, 0, layoutHeight, 0, input.model.height))
        const nodeId = VariantGrid.toNodeId({ x: x_, y: y_ })
        input.onPressIn?.(nodeId)
        console.log('onPressIn', nodeId)
      },
      onPressOut: (e: any) => {
        const x = e.nativeEvent?.locationX
        const y = e.nativeEvent?.locationY
        const x_ = Math.floor(rescale(x, 0, layoutWidth, 0, input.model.width))
        const y_ = Math.floor(rescale(y, 0, layoutHeight, 0, input.model.height))
        const nodeId = VariantGrid.toNodeId({ x: x_, y: y_ })
        input.onPressOut?.(nodeId)
        console.log('onPressOut', nodeId)
      },
      onStartShouldSetResponder: () => true,
      onResponderMove: (e: any) => {
        const x = e.nativeEvent?.locationX
        const y = e.nativeEvent?.locationY
        const x_ = Math.floor(rescale(x, 0, layoutWidth, 0, input.model.width))
        const y_ = Math.floor(rescale(y, 0, layoutHeight, 0, input.model.height))
        const nodeId = VariantGrid.toNodeId({ x: x_, y: y_ })
        if (lastDraggedOverNodeId !== nodeId) {
          input.onDraggedOver?.(nodeId)
          lastDraggedOverNodeId = nodeId
          console.log('onResponderMove', nodeId)
        }
      },
    },
    [h(ViewGrid, input), h(ViewPipelines, input), h(ViewAutocompleteEdge, input), h(ViewCoordinates, input)],
  )
}

const ViewGrid = (input: BoardInput<VariantGrid.Model>) => {
  return h(G, {}, [
    h(Defs, {}, [
      h(Pattern, { id: 'grid', width: '1', height: '1', patternUnits: 'userSpaceOnUse' }, [
        h(Path, {
          d: 'M 1 0 L 0 0 0 1',
          fill: 'none',
          stroke: Color.GRID_LINE_COLOR,
          'stroke-width': '0.02',
        }),
      ]),
    ]),
    h(Rect, {
      x: 0,
      y: 0,
      width: input.model.width,
      height: input.model.height,
      fill: 'url(#grid)',
      stroke: input.borderless ? Color.BACKGROUND_COLOR : Color.GRID_LINE_COLOR,
      'stroke-width': '0.02',
    }),
  ])
}

const ViewPipelines = (input: BoardInput<VariantGrid.Model>) => {
  return h(
    G,
    { transform: 'translate(0.5, 0.5)' },
    map(VariantGrid.yieldTerminals(input.model), (terminal) => h(ViewPipeline, { ...input, terminal })),
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
  const isConnectedWithPipes = Numberlink.isTerminalConnectedWithPipes(input.model, terminal.groupId)
  const shouldShowUsedHint = isConnectedWithPipes && didUseHint

  return h(
    G,
    {
      key: terminal.groupId,
      id: terminal.groupId,
    },
    [
      !input.disableHighlight &&
        h(Path, {
          d: input.isGroupActive?.(terminal.groupId) ? '' : pipelinePathData,
          stroke: groupColor,
          fill: 'none',
          'stroke-linejoin': 'inherit',
          'stroke-linecap': 'square',
          'stroke-width': '1',
          'stroke-opacity': '0.2',
        }),
      h(Path, {
        d: pipelinePathData,
        stroke: groupColor,
        fill: 'none',
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        'stroke-width': EDGE_STROKE_WIDTH,
      }),
      h(Circle, {
        cx: terminal.start.x,
        cy: terminal.start.y,
        r: TERMINAL_NODE_RADIUS,
        fill: groupColor,
      }),
      shouldShowUsedHint && h(HintCheckmark, { x: terminal.start.x, y: terminal.start.y }),
      terminal.end &&
        h(G, {}, [
          h(Circle, {
            cx: terminal.end.x,
            cy: terminal.end.y,
            r: TERMINAL_NODE_RADIUS,
            fill: groupColor,
          }),
          shouldShowUsedHint && h(HintCheckmark, { x: terminal.end.x, y: terminal.end.y }),
        ]),
    ],
  )
}

const HintCheckmark = (input: { x: number; y: number }) => {
  return h(WithPadding, {
    x: input.x - 0.5,
    y: input.y - 0.5,
    width: 1,
    height: 1,
    padding: 0.25,
    render: (input) => h(IconCheckmark, { ...input, fill: 'white', stroke: 'white' }),
  })
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
    input.autocompleteEdge &&
    h(G, { transform: 'translate(0.5, 0.5)' }, [
      h(Line, {
        x1: input.model.positions[input.autocompleteEdge.sourceId]?.x,
        y1: input.model.positions[input.autocompleteEdge.sourceId]?.y,
        x2: input.model.positions[input.autocompleteEdge.targetId]?.x,
        y2: input.model.positions[input.autocompleteEdge.targetId]?.y,
        stroke: Color.groupIdToHex(input.autocompleteEdge.groupId),
        'stroke-width': EDGE_STROKE_WIDTH,
        'stroke-opacity': 0.5,
      }),
    ])
  )
}

const ViewCoordinates = (input: BoardInput<VariantGrid.Model>) => {
  return (
    input.showCoordinates &&
    h(
      G,
      { transform: 'translate(0, 1)' },
      map(VariantGrid.yieldNodes(input.model), (node) => {
        return h(
          SvgText,
          {
            class: 'pointer-events-none',
            key: node.nodeId,
            x: node.x,
            y: node.y,
            'font-size': '0.2',
            fill: '#fff',
            text: `${node.x},${node.y}`,
          },
          [],
        )
      }),
    )
  )
}

const pipelineToSvgPathData = (pipeline: Iterable<VariantGrid.PipeJoined>): string => {
  let path = ''
  for (const pipe of pipeline) {
    path += `M ${pipe.source.x} ${pipe.source.y} L ${pipe.target.x} ${pipe.target.y} `
  }
  return path
}

const map = <T, TY>(iterable: Iterable<T>, fn: (x: T) => TY): TY[] => {
  const result: TY[] = []

  for (const x of iterable) {
    result.push(fn(x))
  }

  return result
}

export const ImplSvgNative = {
  View,
}
