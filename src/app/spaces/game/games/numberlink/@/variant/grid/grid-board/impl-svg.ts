import { h } from '~/@/vdom/h'
import { BoardInput } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { ImplSvgNative } from './impl-svg-native'
import { ImplSvgWeb  } from './impl-svg-web'

const View = (input: BoardInput<VariantGrid.Model>) => {
  switch (input.platform) {
    case 'web': {
      return h(ImplSvgWeb.View, input)
    }
    case 'native': {
      return h(ImplSvgNative.View, input)
    }
  }
}

export const VariantGridBoardSvg = {
  View,
}
