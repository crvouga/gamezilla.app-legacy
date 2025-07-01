import { h } from '~/@/vdom/h'
import type { BoardInput } from '../ui/board'
import { VariantGridBoard } from './grid'
import { VariantHexBoard } from './hex'
import { VariantTriBoard } from './tri'
import type { Model } from './variant'

export const View = (input: BoardInput<Model>) => {
  switch (input.model.t) {
    case 'grid': {
      return h(VariantGridBoard.View, { ...input, model: input.model })
    }

    case 'hex': {
      return h(VariantHexBoard.View, { ...input, model: input.model })
    }

    case 'tri': {
      return h(VariantTriBoard.View, { ...input, model: input.model })
    }
  }
}
