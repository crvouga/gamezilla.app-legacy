import { BoardInput } from '../../../ui/board'
import type * as FlowGrid from '../flow-grid'
import { FlowGridUICanvas } from './impl-canvas'
import { FlowGridUISvg } from './impl-svg'

type FlowGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as FlowGridUIImpl

const View = (input: BoardInput<FlowGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return <FlowGridUISvg.View {...input} />
    }

    case 'canvas': {
      return <FlowGridUICanvas.View {...input} />
    }
  }
}

export const FlowGridBoard = {
  View
}
