import { BoardProps } from '../../../ui/board'
import * as VariantGrid from '../grid'
// import { ImplCanvasNative } from './impl-canvas-native.native'

const View = (input: BoardProps<VariantGrid.Model>) => {
  switch (input.platform) {
    case 'web': {
      return null
    }
    case 'native': {
      return null
      // return h(ImplCanvasNative.View, input)
    }
  }
}

export const ImplCanvas = {
  View,
}
