import { FlowGridUI } from "./flow-grid"
import { FlowHexUI } from "./flow-hex"
import { FlowViewProps } from "../flow/flow-ui"
import { Model } from "./flow-variant"

export const View = (props: FlowViewProps<Model>) => {
  switch (props.model.t) {
    case "flow-grid": {
      return <FlowGridUI.View {...props} model={props.model} />
    }

    case "flow-hex": {
      return <FlowHexUI.View {...props} model={props.model} />
    }
  }
}
