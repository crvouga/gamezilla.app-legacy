import type { FlowUI } from '../../../flow'
import type * as FlowGrid from '../flow-grid'
import { FlowGridUICanvas } from './flow-grid-ui-canvas'
import { FlowGridUISvg } from './flow-grid-ui-svg'

type FlowGridUIImpl = 'svg' | 'canvas'

const IMPL = 'svg' as FlowGridUIImpl

const View = (input: FlowUI.FlowViewInput<FlowGrid.Model>) => {
  switch (IMPL) {
    case 'svg': {
      return <FlowGridUISvg.View {...input} />
    }

    case 'canvas': {
      return <FlowGridUICanvas.View {...input} />
    }
  }
}

export const FlowGridUI = {
  View
}
