import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { VariantGridBoardCanvas } from './impl-canvas'
import { VariantGridBoardSvg } from './impl-svg'

type VariantGridUIImpl = 'svg' | 'canvas'

const IMPL = 'canvas' as VariantGridUIImpl

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return h(VariantGridBoardSvg.View, input)
    }

    case 'canvas': {
      return h(VariantGridBoardCanvas.View, input)
    }
  }
}

export const VariantGridBoard = {
  View,
}
