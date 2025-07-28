import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { ImplCanvasWeb } from './impl-canvas-web'
import { ImplSvgWeb } from './impl-svg-web'

type VariantGridUIImpl = 'svg' | 'canvas'

const IMPL = 'canvas' as VariantGridUIImpl

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return h(ImplSvgWeb.View, input)
    }

    case 'canvas': {
      return h(ImplCanvasWeb.View, input)
    }
  }
}

export const VariantGridBoard = {
  View,
}
