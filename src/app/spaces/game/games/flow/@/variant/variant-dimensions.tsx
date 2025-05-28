import { p } from '~/@/schema'
import { VariantGridDimensions } from './grid'
import { VariantHexDimensions } from './hex'
import { VariantTriDimensions } from './tri'
import { Translator } from '~/@/l18n/generated'

export const Model = p.or(VariantGridDimensions.Model, VariantHexDimensions.Model, VariantTriDimensions.Model)

export type Model = p.Infer<typeof Model>

export const init = (model: Model): Model => {
  switch (model.t) {
    case 'flow-grid': {
      return VariantGridDimensions.init(model)
    }

    case 'flow-hex': {
      return VariantHexDimensions.init(model)
    }

    case 'flow-tri': {
      return VariantTriDimensions.init(model)
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
      return <VariantGridDimensions.ViewForm ctx={input.ctx} form={input.form} onInput={input.onInput} />
    }

    case 'flow-hex': {
      return <VariantHexDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }

    case 'flow-tri': {
      return <VariantTriDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }
  }
}
