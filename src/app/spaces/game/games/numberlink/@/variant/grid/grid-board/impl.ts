import { h } from '~/@/vdom/h'
import { BoardProps } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { ImplCanvasWeb } from './impl-canvas-web'
import { ImplSvgWeb } from './impl-svg-web'

type VariantGridUIImpl = 'svg' | 'canvas'

const View = (input: BoardProps<VariantGrid.Model>) => {
  const impl: VariantGridUIImpl = input.platform === 'web' ? 'svg' : 'canvas'
  switch (impl) {
    case 'svg':
      return h(ImplSvgWeb.View, input)
    case 'canvas':
      return h(ImplCanvasWeb.View, input)
  }
}

export const VariantGridBoard = {
  View,
}
