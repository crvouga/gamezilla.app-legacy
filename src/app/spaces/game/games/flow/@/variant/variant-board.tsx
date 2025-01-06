import type { BoardInput } from '../ui/board'
import { VariantGridBoard } from './grid'
import { VariantHexBoard } from './hex'
import { VariantTriBoard } from './tri'
import type { Model } from './variant'

export const View = (input: BoardInput<Model>) => {
  switch (input.model.t) {
    case 'flow-grid': {
      return <VariantGridBoard.View {...input} model={input.model} />
    }

    case 'flow-hex': {
      return <VariantHexBoard.View {...input} model={input.model} />
    }

    case 'flow-tri': {
      return <VariantTriBoard.View {...input} model={input.model} />
    }
  }
}
