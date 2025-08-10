import { chunk } from '~/@/array/chunk'
import { ensureLength } from '~/@/array/ensure-length'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'
import { sx } from '../theme/theme'

export const Grid = (input: {
  columnCount: number
  items: VDom[]
  rootStyle?: Record<string, unknown>
  rowStyle?: Record<string, unknown>
  itemStyle?: Record<string, unknown>
}) => {
  const rows = chunk(input.items, input.columnCount)
  return h(
    Box,
    {
      style: {
        ...sx({
          flex: 1,
          flexDirection: 'col',
        }),
        ...input.rootStyle,
      },
    },
    rows.map((row) =>
      h(
        Box,
        {
          style: {
            ...sx({ flex: 1, flexDirection: 'row' }),
            ...input.rowStyle,
          },
        },
        ensureLength(row, input.columnCount, null).map((item) =>
          h(
            Box,
            {
              style: {
                ...sx({ flex: 1, flexDirection: 'col' }),
                ...input.itemStyle,
              },
            },
            [item],
          ),
        ),
      ),
    ),
  )
}
