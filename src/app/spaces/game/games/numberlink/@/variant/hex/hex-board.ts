import { h } from '~/@/vdom/h'
import { BoardInput } from '../../ui/board'
import type * as VariantHex from './hex'

export const View = (_input: BoardInput<VariantHex.Model>) => {
  return h('div', {}, ['VariantHex'])
}
