import { chunk } from '~/@/array/chunk'
import { ensureLength } from '~/@/array/ensure-length'
import { cn } from '~/@/ui/cn'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { h } from '~/@/vdom/vdom-engine/impl'

export const Grid = (input: {
  columnCount: number
  items: VDom[]
  rootClass?: string
  rowClass?: string
  itemClass?: string
}) => {
  const rows = chunk(input.items, input.columnCount)
  return h(
    Box,
    { class: cn('flex flex-1 flex-col', input.rootClass) },
    rows.map((row) =>
      h(
        Box,
        { class: cn('flex flex-row', input.rowClass) },
        ensureLength(row, input.columnCount, null).map((item) =>
          h(Box, { class: cn('flex-1', input.itemClass) }, [item]),
        ),
      ),
    ),
  )
}
