import { FlowUI } from "../../../flow"
import * as FlowGrid from "../flow-grid"
import { FlowGridUICanvas } from "./flow-grid-ui-canvas"
import { FlowGridUISvg } from "./flow-grid-ui-svg"

type FlowGridUIImpl = "svg" | "canvas"

const IMPL = "svg" as FlowGridUIImpl

const View = (props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
  switch (IMPL) {
    case "svg": {
      return <FlowGridUISvg.View {...props} />
    }

    case "canvas": {
      return <FlowGridUICanvas.View {...props} />
    }
  }
}

export const FlowGridUI = {
  View,
}
