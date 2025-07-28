import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { Canvas } from '~/@/vdom/primitives/canvas'
import { BoardInput } from '../../../ui/board'
import { Color } from '../../../ui/color'
import * as VariantGrid from '../grid'

export const paint = (model: VariantGrid.Model, ctx: CanvasRenderingContext2D) => {
  const canvasWidth = ctx.canvas.width
  ctx.canvas.height = (canvasWidth * model.height) / model.width
  const canvasHeight = ctx.canvas.height

  const cellWidth = canvasWidth / model.width
  const cellHeight = canvasHeight / model.height

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  //
  //
  // Grid
  //
  //

  ctx.strokeStyle = 'green'
  for (let x = 0; x <= model.width; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellWidth, 0)
    ctx.lineTo(x * cellWidth, canvasHeight)
    ctx.closePath()
    ctx.stroke()
  }
  for (let y = 0; y <= model.height; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellHeight)
    ctx.lineTo(canvasWidth, y * cellHeight)
    ctx.closePath()
    ctx.stroke()
  }

  //
  //
  // Terminals
  //
  //

  for (const terminal of VariantGrid.yieldTerminals(model)) {
    ctx.fillStyle = Color.groupIdToHex(terminal.groupId)
    const radius = cellWidth / 2.5
    ctx.beginPath()
    ctx.arc(
      terminal.start.x * cellWidth + cellWidth / 2,
      terminal.start.y * cellHeight + cellHeight / 2,
      radius,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    ctx.closePath()

    if (terminal.end) {
      ctx.beginPath()
      ctx.arc(
        terminal.end.x * cellWidth + cellWidth / 2,
        terminal.end.y * cellHeight + cellHeight / 2,
        radius,
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.closePath()
    }

    //
    //
    // Pipes
    //
    //

    ctx.lineWidth = cellWidth / 3
    for (const pipe of VariantGrid.yieldPipes(model)) {
      ctx.strokeStyle = Color.groupIdToHex(pipe.groupId)
      ctx.fillStyle = Color.groupIdToHex(pipe.groupId)
      ctx.beginPath()
      ctx.moveTo(pipe.source.x * cellWidth + cellWidth / 2, pipe.source.y * cellHeight + cellHeight / 2)
      ctx.lineTo(pipe.target.x * cellWidth + cellWidth / 2, pipe.target.y * cellHeight + cellHeight / 2)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(
        pipe.target.x * cellWidth + cellWidth / 2,
        pipe.target.y * cellHeight + cellHeight / 2,
        cellWidth / 6,
        0,
        Math.PI * 2,
      )
      ctx.fill()
      ctx.closePath()
    }
  }
}

const View = ({ model, isDragging, onPressIn: onPress, onPressOut }: BoardInput<VariantGrid.Model>) => {
  return h(Canvas, {
    class: cn('aspect-square w-full', isDragging ? 'cursor-grabbing' : 'cursor-grab'),
    // paint: (value, ctx) => paint(value, ctx),
    onPress: (event_: unknown) => {
      const event = event_ as MouseEvent
      // event.preventDefault()
      // event.stopImmediatePropagation()
      // event.stopPropagation()
      const canvas = event.currentTarget as HTMLCanvasElement
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      const cellWidth = rect.width / model.width
      const cellHeight = rect.height / model.height

      const xIndex = Math.floor(x * model.width)
      const yIndex = Math.floor(y * model.height)

      const cellX = xIndex * cellWidth
      const cellY = yIndex * cellHeight

      if (x * model.width - cellX < cellWidth / 2 && y * model.height - cellY < cellHeight / 2) {
        const nodeId = VariantGrid.toNodeId({
          x: xIndex,
          y: yIndex,
        })
        onPress?.(nodeId)
      }
    },
    onPressOut: (event: any) => {
      const canvas = event.currentTarget as HTMLCanvasElement
      const rect = canvas.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      const cellWidth = rect.width / model.width
      const cellHeight = rect.height / model.height

      const xIndex = Math.floor(x * model.width)
      const yIndex = Math.floor(y * model.height)

      const cellX = xIndex * cellWidth
      const cellY = yIndex * cellHeight

      if (x * model.width - cellX < cellWidth / 2 && y * model.height - cellY < cellHeight / 2) {
        const nodeId = VariantGrid.toNodeId({
          x: xIndex,
          y: yIndex,
        })

        onPressOut?.(nodeId)
      }
    },
  })
}

export const VariantGridBoardCanvas = {
  View,
}
