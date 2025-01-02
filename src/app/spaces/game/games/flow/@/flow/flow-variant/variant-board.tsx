import type { BoardInput } from '../ui/board'
import { FlowGridBoard } from './flow-grid'
import { FlowHexBoard } from './flow-hex'
import { FlowTriBoard } from './flow-tri'
import type { Model } from './variant'

export const View = (input: BoardInput<Model>) => {
  switch (input.model.t) {
    case 'flow-grid': {
      return <FlowGridBoard.View {...input} model={input.model} />
    }

    case 'flow-hex': {
      return <FlowHexBoard.View {...input} model={input.model} />
    }

    case 'flow-tri': {
      return <FlowTriBoard.View {...input} model={input.model} />
    }
  }
}
