import { v } from '~/@/vdom/v'
import { BoardInput } from '../../ui/board'
import type * as VariantTri from './tri'

export const View = (_input: BoardInput<VariantTri.Model>) => {
  return v('div', {}, ['VariantTri'])
}
