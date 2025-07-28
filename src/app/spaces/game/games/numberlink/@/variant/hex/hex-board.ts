import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { BoardProps } from '../../ui/board'
import type * as VariantHex from './hex'
import { Text } from '~/@/vdom/primitives/text'

export const View = (_input: BoardProps<VariantHex.Model>) => {
  return h(Box, {}, [Text({ text: 'VariantHex' })])
}
