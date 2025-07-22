import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { BoardInput } from '../../ui/board'
import type * as VariantTri from './tri'
import { Text } from '~/@/vdom/primitives/text'

export const View = (_input: BoardInput<VariantTri.Model>) => {
  return h(Box, {}, [Text({ text: 'VariantTri' })])
}
