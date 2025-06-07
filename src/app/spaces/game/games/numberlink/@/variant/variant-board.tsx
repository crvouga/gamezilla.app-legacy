import type { BoardInput } from '../ui/board'
import { VariantGridBoard } from './grid'
import { VariantHexBoard } from './hex'
import { VariantTriBoard } from './tri'
import type { Model } from './variant'

export const View = (input: BoardInput<Model>) => {
  switch (input.model.t) {
    case 'grid': {
      return <VariantGridBoard.View {...input} model={input.model} />
    }

    case 'hex': {
      return <VariantHexBoard.View {...input} model={input.model} />
    }

    case 'tri': {
      return <VariantTriBoard.View {...input} model={input.model} />
    }
  }
}
