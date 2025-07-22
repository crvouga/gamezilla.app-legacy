import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { BoardInput } from '../../ui/board'
import type * as VariantHex from './hex'

export const View = (_input: BoardInput<VariantHex.Model>) => {
  return h(Box, {}, ['VariantHex'])
}
