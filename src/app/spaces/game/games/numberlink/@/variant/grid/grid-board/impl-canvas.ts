import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { VariantGridBoardCanvas as Native } from './impl-canvas.native'
import { VariantGridBoardCanvas as Web } from './impl-canvas.web'

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (input.platform) {
    case 'web': {
      return h(Web.View, input)
    }
    case 'native': {
      return h(Native.View, input)
    }
  }
}

export const VariantGridBoardCanvas = {
  View,
}
