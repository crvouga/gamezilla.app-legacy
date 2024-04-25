import { Canvas } from "gamezilla-app/@CHILD/app/@SHARED/ui/canvas"
import { FlowUI } from "../../../flow"
import * as FlowGrid from "../flow-grid"

const View = (_props: FlowUI.FlowViewProps<FlowGrid.Model>) => {
  return (
    <Canvas
      width={100}
      height={100}
      paint={(ctx) => {
        ctx.clearRect(0, 0, 100, 100)
      }}
    />
  )
}

export const FlowGridUICanvas = {
  View,
}
