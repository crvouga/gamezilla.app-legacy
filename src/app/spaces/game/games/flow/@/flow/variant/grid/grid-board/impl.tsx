import { BoardInput } from '../../../ui/board'
import type * as FlowGrid from '../grid'
import { FlowGridBoardCanvas } from './impl-canvas'
import { FlowGridBoardSvg } from './impl-svg'

type FlowGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as FlowGridUIImpl

const View = (input: BoardInput<FlowGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return <FlowGridBoardSvg.View {...input} />
    }

    case 'canvas': {
      return <FlowGridBoardCanvas.View {...input} />
    }
  }
}

export const FlowGridBoard = {
  View,
}
