import { Canvas, Group, Line, Circle } from '@shopify/react-native-skia'
import { View as RNView } from 'react-native'
import { useMemo, useState } from 'react'
import { BoardProps } from '../../../ui/board'
import { NodeId } from '../../../numberlink/node-id'
import { rescale } from '~/@/math/rescale'
import { Color } from '../../../ui/color'
import * as VariantGrid from '../grid'
import { h } from '~/@/vdom/h'

const TERMINAL_NODE_RADIUS = 0.33
const EDGE_STROKE_WIDTH = 0.3
const GRID_LINE_WIDTH = 0.02

export const ImplCanvasNative = {
  View: (props: BoardProps<VariantGrid.Model>) => {
    const [layout, setLayout] = useState({ width: 0, height: 0 })
    let lastDraggedOverNodeId: NodeId | null = null

    const locateNode = (x: number, y: number) => {
      const x_ = Math.floor(rescale(x, 0, layout.width, 0, props.model.width))
      const y_ = Math.floor(rescale(y, 0, layout.height, 0, props.model.height))
      return VariantGrid.toNodeId({ x: x_, y: y_ })
    }

    const gridLines = useMemo(() => {
      const lines = []
      for (let x = 0; x <= props.model.width; x++) {
        lines.push(
          h(Line, {
            key: `v-${x}`,
            p1: { x, y: 0 },
            p2: { x, y: props.model.height },
            strokeWidth: GRID_LINE_WIDTH,
            color: Color.GRID_LINE_COLOR,
          }),
        )
      }
      for (let y = 0; y <= props.model.height; y++) {
        lines.push(
          h(Line, {
            key: `h-${y}`,
            p1: { x: 0, y },
            p2: { x: props.model.width, y },
            strokeWidth: GRID_LINE_WIDTH,
            color: Color.GRID_LINE_COLOR,
          }),
        )
      }
      return lines
    }, [props.model.width, props.model.height])

    const pipelineElements = useMemo(() => {
      const elements = []
      const model = props.model

      for (const terminal of VariantGrid.yieldTerminals(model)) {
        const groupColor = Color.groupIdToHex(terminal.groupId)
        const pipeline = VariantGrid.toPipeline(model, terminal.startId)

        for (const segment of pipeline) {
          elements.push(
            h(Line, {
              key: `seg-${terminal.startId}-${segment.source.x}-${segment.source.y}-${segment.target.x}-${segment.target.y}`,
              p1: segment.source,
              p2: segment.target,
              color: groupColor,
              strokeWidth: EDGE_STROKE_WIDTH,
            }),
          )
        }

        elements.push(
          // @ts-ignore
          h(Circle, {
            key: `start-${terminal.startId}`,
            cx: terminal.start.x,
            cy: terminal.start.y,
            r: TERMINAL_NODE_RADIUS,
            color: groupColor,
          }),
        )

        if (terminal.end) {
          elements.push(
            // @ts-ignore
            h(Circle, {
              key: `end-${terminal.startId}`,
              cx: terminal.end.x,
              cy: terminal.end.y,
              r: TERMINAL_NODE_RADIUS,
              color: groupColor,
            }),
          )
        }
      }

      return elements
    }, [props.model])

    return h(
      // @ts-ignore
      RNView,
      {
        style: { flex: 1, width: '100%' },
        onLayout: (e: any) => {
          const { width, height } = e.nativeEvent.layout
          setLayout({ width, height })
        },
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (e: any) => {
          const { locationX: x, locationY: y } = e.nativeEvent
          const nodeId = locateNode(x, y)
          props.onPressDown?.(nodeId)
          lastDraggedOverNodeId = nodeId
        },
        onResponderMove: (e: any) => {
          const { locationX: x, locationY: y } = e.nativeEvent
          const nodeId = locateNode(x, y)
          if (lastDraggedOverNodeId !== nodeId) {
            props.onDraggedOver?.(nodeId)
            lastDraggedOverNodeId = nodeId
          }
        },
        onResponderRelease: (e: any) => {
          const { locationX: x, locationY: y } = e.nativeEvent
          const nodeId = locateNode(x, y)
          props.onPressUp?.(nodeId)
          lastDraggedOverNodeId = null
        },
        onResponderTerminate: (e: any) => {
          const { locationX: x, locationY: y } = e.nativeEvent
          const nodeId = locateNode(x, y)
          props.onPressUp?.(nodeId)
          lastDraggedOverNodeId = null
        },
      },
      [
        h(Canvas, { style: { flex: 1 }, pointerEvents: 'none' }, [
          h(
            Group,
            {
              transform: [{ scale: layout.width / props.model.width }],
            },
            [...gridLines, ...pipelineElements],
          ),
        ]),
      ],
    )
  },
}
