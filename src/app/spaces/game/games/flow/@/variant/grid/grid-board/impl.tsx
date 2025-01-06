import { BoardInput } from '../../../ui/board'
import type * as VariantGrid from '../grid'
import { VariantGridBoardCanvas } from './impl-canvas'
import { VariantGridBoardSvg } from './impl-svg'

type VariantGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as VariantGridUIImpl

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return <VariantGridBoardSvg.View {...input} />
    }

    case 'canvas': {
      return <VariantGridBoardCanvas.View {...input} />
    }
  }
}

export const VariantGridBoard = {
  View,
}
