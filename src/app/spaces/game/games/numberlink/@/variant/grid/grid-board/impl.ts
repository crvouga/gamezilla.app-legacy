import { h } from '~/@/vdom/h'
import { BoardProps } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { ImplCanvas } from './impl-canvas'
import { ImplSvgUniversal } from './impl-svg-universal'

type VariantGridUIImpl = 'svg' | 'canvas'

const View = (input: BoardProps<VariantGrid.Model>) => {
  const impl: VariantGridUIImpl = input.platform === 'web' ? 'svg' : 'canvas'
  switch (impl) {
    case 'svg':
      return h(ImplSvgUniversal.View, input)
    case 'canvas':
      return h(ImplCanvas.View, input)
  }
}

export const VariantGridBoard = {
  View,
}
