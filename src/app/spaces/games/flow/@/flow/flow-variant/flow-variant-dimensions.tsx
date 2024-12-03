import { p } from '~/@/core/parser'
import { FlowGridDimensions } from './flow-grid'
import { FlowHexDimensions } from './flow-hex'
import { FlowTriDimensions } from './flow-tri'
import { Translator } from '~/@/l18n/generated'

export const Model = p.or(FlowGridDimensions.Model, FlowHexDimensions.Model, FlowTriDimensions.Model)

export type Model = p.Infer<typeof Model>

export const init = (model: Model): Model => {
  switch (model.t) {
    case 'flow-grid': {
      return FlowGridDimensions.init(model)
    }

    case 'flow-hex': {
      return FlowHexDimensions.init(model)
    }

    case 'flow-tri': {
      return FlowTriDimensions.init(model)
    }
  }
}

export const ViewForm = (input: {
  form: Model
  onInput: (dimensions: Model) => void
  ctx: {
    t: Translator
  }
}) => {
  switch (input.form.t) {
    case 'flow-grid': {
      return <FlowGridDimensions.ViewForm ctx={input.ctx} form={input.form} onInput={input.onInput} />
    }

    case 'flow-hex': {
      return <FlowHexDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }

    case 'flow-tri': {
      return <FlowTriDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }
  }
}
