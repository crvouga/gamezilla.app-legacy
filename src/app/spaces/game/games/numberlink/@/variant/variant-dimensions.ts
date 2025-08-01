import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { h } from '~/@/vdom/h'
import { VariantGridDimensions } from './grid/grid-dimensions'
import { VariantHexDimensions } from './hex'
import { VariantTriDimensions } from './tri'

const schema = s.or(VariantGridDimensions.schema, VariantHexDimensions.Model, VariantTriDimensions.Model)

export type VariantDimensions = s.Infer<typeof schema>

const init = (model: VariantDimensions): VariantDimensions => {
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

const ViewForm = (input: {
  form: VariantDimensions
  onInput: (dimensions: VariantDimensions) => void
  ctx: {
    t: Translator
  }
}) => {
  switch (input.form.t) {
    case 'grid': {
      return h(VariantGridDimensions.ViewForm, { ctx: input.ctx, form: input.form, onInput: input.onInput })
    }

    case 'hex': {
      return h(VariantHexDimensions.ViewForm, { form: input.form, onInput: input.onInput })
    }

    case 'tri': {
      return h(VariantTriDimensions.ViewForm, { form: input.form, onInput: input.onInput })
    }
  }
}

export const VariantDimensions = {
  schema,
  init,
  ViewForm,
}
