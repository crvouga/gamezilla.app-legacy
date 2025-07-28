import { Canvas, Circle, Group, Line, Path, Skia } from '@shopify/react-native-skia'
import { View as RNView } from 'react-native'
import { rescale } from '~/@/math/rescale'
import { h } from '~/@/vdom/h'
import { NodeId } from '../../../numberlink/node-id'
import { BoardInput } from '../../../ui/board'
import { Color } from '../../../ui/color'
import * as VariantGrid from '../grid'

const TERMINAL_NODE_RADIUS = 0.33
const EDGE_STROKE_WIDTH = 0.3

let layoutWidth = 0
let layoutHeight = 0
let lastDraggedOverNodeId: NodeId | null = null

export const VariantGridBoardCanvas = {
  View: (input: BoardInput<VariantGrid.Model>) => {
    if (!layoutWidth || !layoutHeight) {
      return h(
        // @ts-ignore
        RNView,
        {
          style: { flex: 1, width: '100%' },
          onLayout: (e: any) => {
            const { width, height } = e.nativeEvent.layout
            layoutWidth = width
            layoutHeight = height
          },
        },
        [],
      )
    }

    const locateNode = (x: number, y: number) => {
      const x_ = Math.floor(rescale(x, 0, layoutWidth, 0, input.model.width))
      const y_ = Math.floor(rescale(y, 0, layoutHeight, 0, input.model.height))
      return VariantGrid.toNodeId({ x: x_, y: y_ })
    }

    const gridStrokeWidth = 0.02
    const edgeStrokeWidth = EDGE_STROKE_WIDTH

    // Generate grid lines
    const verticalLines = []
    for (let x = 0; x <= input.model.width; x++) {
      verticalLines.push(
        h(
          // @ts-ignore
          Line,
          {
            key: `v-${x}`,
            p1: { x, y: 0 },
            p2: { x, y: input.model.height },
            color: Color.GRID_LINE_COLOR,
            strokeWidth: gridStrokeWidth,
          },
        ),
      )
    }

    const horizontalLines = []
    for (let y = 0; y <= input.model.height; y++) {
      horizontalLines.push(
        h(
          // @ts-ignore
          Line,
          {
            key: `h-${y}`,
            p1: { x: 0, y },
            p2: { x: input.model.width, y },
            color: Color.GRID_LINE_COLOR,
            strokeWidth: gridStrokeWidth,
          },
        ),
      )
    }

    // Generate pipeline elements
    const pipelineElements = []
    for (const terminal of VariantGrid.yieldTerminals(input.model)) {
      const groupColor = Color.groupIdToHex(terminal.groupId)
      const pipeline = VariantGrid.toPipeline(input.model, terminal.startId)

      // Create path for the pipeline
      const path = Skia.Path.Make()
      for (const segment of pipeline) {
        path.moveTo(segment.source.x, segment.source.y)
        path.lineTo(segment.target.x, segment.target.y)
      }

      // Add pipeline path as individual line segments
      for (const segment of pipeline) {
        pipelineElements.push(
          h(
            // @ts-ignore
            Line,
            {
              key: `pipeline-${terminal.startId}-${segment.source.x}-${segment.source.y}-${segment.target.x}-${segment.target.y}`,
              p1: segment.source,
              p2: segment.target,
              color: groupColor,
              strokeWidth: edgeStrokeWidth,
            },
          ),
        )
      }

      // Add start circle
      pipelineElements.push(
        h(
          // @ts-ignore
          Circle,
          {
            key: `start-${terminal.startId}`,
            cx: terminal.start.x,
            cy: terminal.start.y,
            r: TERMINAL_NODE_RADIUS,
            color: groupColor,
          },
        ),
      )

      // Add end circle if exists
      if (terminal.end) {
        pipelineElements.push(
          h(
            // @ts-ignore
            Circle,
            {
              key: `end-${terminal.startId}`,
              cx: terminal.end.x,
              cy: terminal.end.y,
              r: TERMINAL_NODE_RADIUS,
              color: groupColor,
            },
          ),
        )
      }
    }

    return h(
      // @ts-ignore
      RNView,
      {
        style: { flex: 1, width: '100%' },
        onLayout: (e: any) => {
          const { width, height } = e.nativeEvent.layout
          layoutWidth = width
          layoutHeight = height
        },
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (e: any) => {
          const x = e.nativeEvent.locationX
          const y = e.nativeEvent.locationY
          const nodeId = locateNode(x, y)
          input.onPressIn?.(nodeId)
          lastDraggedOverNodeId = nodeId
          console.log('onPressIn', nodeId)
        },
        onResponderMove: (e: any) => {
          const x = e.nativeEvent.locationX
          const y = e.nativeEvent.locationY
          const nodeId = locateNode(x, y)
          if (lastDraggedOverNodeId !== nodeId) {
            input.onDraggedOver?.(nodeId)
            lastDraggedOverNodeId = nodeId
            console.log('onDraggedOver', nodeId)
          }
        },
        onResponderRelease: (e: any) => {
          const x = e.nativeEvent.locationX
          const y = e.nativeEvent.locationY
          const nodeId = locateNode(x, y)
          input.onPressOut?.(nodeId)
          lastDraggedOverNodeId = null
          console.log('onPressOut', nodeId)
        },
        onResponderTerminate: (e: any) => {
          const x = e.nativeEvent.locationX
          const y = e.nativeEvent.locationY
          const nodeId = locateNode(x, y)
          input.onPressOut?.(nodeId)
          lastDraggedOverNodeId = null
          console.log('onPressOut (terminate)', nodeId)
        },
      },
      [
        h(
          // @ts-ignore
          Canvas,
          {
            style: { flex: 1, pointerEvents: 'none' },
          },
          [
            h(
              // @ts-ignore
              Group,
              {
                transform: [{ scale: layoutWidth / input.model.width }],
              },
              [
                // Grid lines
                ...verticalLines,
                ...horizontalLines,
                // Pipeline elements
                ...pipelineElements,
                // Autocomplete edge
              ],
            ),
          ],
        ),
      ],
    )
  },
}
