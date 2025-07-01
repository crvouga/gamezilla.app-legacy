import { BoardInput } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { VariantGridBoardCanvas } from './impl-canvas'
import { VariantGridBoardSvg } from './impl-svg'
import { v } from '~/@/vdom/v'

type VariantGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as VariantGridUIImpl

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return v(VariantGridBoardSvg.View, input)
    }

    case 'canvas': {
      return v(VariantGridBoardCanvas.View, input)
    }
  }
}

export const VariantGridBoard = {
  View,
}
