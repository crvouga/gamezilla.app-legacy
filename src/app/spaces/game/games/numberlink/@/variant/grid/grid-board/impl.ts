import { h } from '~/@/vdom/h'
import { BoardProps } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { ImplCanvas } from './impl-canvas'
import { ImplSvgUniversal } from './impl-svg-universal'

export type VariantGridUIImpl = 'svg' | 'canvas'

const View = (input: BoardProps<VariantGrid.Model>) => {
  switch (input.impl.t) {
    case 'svg':
      return h(ImplSvgUniversal.View, input)
    case 'canvas':
      return h(ImplCanvas.View, input)
  }
}

export const VariantGridBoard = {
  View,
}
