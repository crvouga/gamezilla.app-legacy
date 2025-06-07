import { s } from '~/@/schema'
import { VariantGridDimensions } from './grid'
import { VariantHexDimensions } from './hex'
import { VariantTriDimensions } from './tri'
import { Translator } from '~/@/l18n/generated'

export const Model = s.or(VariantGridDimensions.Model, VariantHexDimensions.Model, VariantTriDimensions.Model)

export type Model = s.Infer<typeof Model>

export const init = (model: Model): Model => {
  switch (model.t) {
    case 'grid': {
      return VariantGridDimensions.init(model)
    }

    case 'hex': {
      return VariantHexDimensions.init(model)
    }

    case 'tri': {
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
    case 'grid': {
      return <VariantGridDimensions.ViewForm ctx={input.ctx} form={input.form} onInput={input.onInput} />
    }

    case 'hex': {
      return <VariantHexDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }

    case 'tri': {
      return <VariantTriDimensions.ViewForm form={input.form} onInput={input.onInput} />
    }
  }
}
