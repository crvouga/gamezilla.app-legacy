import { h } from '~/@/vdom/h'
import { BoardProps } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { ImplSvgUniversal } from './impl-svg-universal'

const View = (input: BoardProps<VariantGrid.Model>) => {
  return h(ImplSvgUniversal.View, input)
}

export const ImplSvg = {
  View,
}
