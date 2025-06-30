import { BoardInput } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { VariantGridBoardCanvas } from './impl-canvas'
import { VariantGridBoardSvg } from './impl-svg'
import { h } from '~/@/vdom/h'

type VariantGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as VariantGridUIImpl

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
