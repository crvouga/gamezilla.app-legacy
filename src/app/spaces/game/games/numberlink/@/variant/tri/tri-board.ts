import { h } from '~/@/vdom/h'
import { BoardInput } from '../../ui/board'
import type * as VariantTri from './tri'

export const View = (_input: BoardInput<VariantTri.Model>) => {
  return h('div', {}, ['VariantTri'])
}
