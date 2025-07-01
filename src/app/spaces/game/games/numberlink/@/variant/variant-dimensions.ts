import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { v } from '~/@/vdom/v'
import { VariantGridDimensions } from './grid'
import { VariantHexDimensions } from './hex'
import { VariantTriDimensions } from './tri'

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
      return v(VariantGridDimensions.ViewForm, { ctx: input.ctx, form: input.form, onInput: input.onInput })
    }

    case 'hex': {
      return v(VariantHexDimensions.ViewForm, { form: input.form, onInput: input.onInput })
    }

    case 'tri': {
      return v(VariantTriDimensions.ViewForm, { form: input.form, onInput: input.onInput })
    }
  }
}
