import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { VariantGridBoardSvg as Native } from './impl-svg.native'
import { VariantGridBoardSvg as Web } from './impl-svg.web'

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

export const VariantGridBoardSvg = {
  View,
}
