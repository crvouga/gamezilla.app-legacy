import { h } from '~/@/vdom/h'
import { BoardProps } from '../../../ui/board'
import * as VariantGrid from '../grid'
import { ImplCanvasNative } from './impl-canvas-native'
import { ImplCanvasWeb } from './impl-canvas-web'

const View = (input: BoardProps<VariantGrid.Model>) => {
  switch (input.platform) {
    case 'web': {
      return h(ImplCanvasWeb.View, input)
    }
    case 'native': {
      return h(ImplCanvasNative.View, input)
    }
  }
}

export const VariantGridBoardCanvas = {
  View,
}
