import { Canvas, Circle, Group } from '@shopify/react-native-skia'
import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import * as VariantGrid from '../grid'

const View = (_input: BoardInput<VariantGrid.Model>) => {
  const width = 256
  const height = 256
  const r = width * 0.33
  console.log('\n\n\nHELLO\n\n\n')
  return h(
    Canvas,
    {
      style: { width, height },
    },
    [
      h(
        Group,
        {
          blendMode: 'multiply',
        },
        [
          h(Circle, {
            cx: r,
            cy: r,
            r: r,
            color: 'cyan',
          }),
          h(Circle, {
            cx: width - r,
            cy: r,
            r: r,
            color: 'magenta',
          }),
          h(Circle, {
            cx: width / 2,
            cy: width - r,
            r: r,
            color: 'yellow',
          }),
        ],
      ),
    ],
  )
}

export const VariantGridBoardCanvas = {
  View,
}
