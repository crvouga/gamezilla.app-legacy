import { FlowHexDimensions } from "./flow-hex"
import { FlowGridDimensions } from "./flow-grid"

export type Model = FlowGridDimensions.Model | FlowHexDimensions.Model

export const init = (model: Model): Model => {
  switch (model.t) {
    case "flow-grid": {
      return FlowGridDimensions.init(model)
    }

    case "flow-hex": {
      return FlowHexDimensions.init(model)
    }
  }
}

export const ViewForm = (input: {
  form: Model
  onInput: (dimensions: Model) => void
}) => {
  switch (input.form.t) {
    case "flow-grid": {
      return (
        <FlowGridDimensions.ViewForm
          form={input.form}
          onInput={input.onInput}
        />
      )
    }

    case "flow-hex": {
      return (
        <FlowHexDimensions.ViewForm form={input.form} onInput={input.onInput} />
      )
    }
  }
}
