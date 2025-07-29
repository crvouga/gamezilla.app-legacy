import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { BoardProps } from '../../ui/board'
import type * as VariantTri from './tri'
import { Text } from '~/@/vdom/primitives/text'

export const View = (_input: BoardProps<VariantTri.Model>) => {
  return h(Box, {}, [h(Text, { text: 'VariantTri' })])
}
