import { Translator } from '~/@/l18n/generated'
import { s } from '~/@/schema'
import { IconXMark } from '~/@/ui/icon'
import { Slider } from '~/@/ui/slider'
import { v } from '~/@/vdom/v'

export const Model = s.obj({
  t: s.l('grid'),
  width: s.num(),
  height: s.num(),
})

export type Model = s.Infer<typeof Model>

export const init = (model: { width: number; height: number }): Model => {
  return {
    t: 'grid',
    width: model.width,
    height: model.height,
  }
}

export const ViewForm = (input: {
  form: Model
  onInput: (dimensions: Model) => void
  ctx: {
    t: Translator
  }
}) => {
  return v('div', { className: 'flex flex-col gap-4 p-6' }, [
    v('div', { className: 'flex items-center justify-center gap-1 text-center text-4xl font-bold' }, [
      v('p', {}, [`${input.form.width}w`]),

      v(IconXMark, { className: 'size-6' }),

      v('p', {}, [`${input.form.height}h`]),
    ]),

    v('div', { className: 'flex flex-col gap-3' }, [
      v(Slider, {
        onInput: (width) => input.onInput({ ...input.form, width }),
        value: input.form.width,
        label: input.ctx.t('app.width'),
        min: 3,
        max: 15,
        step: 1,
      }),
      v(Slider, {
        onInput: (height) => input.onInput({ ...input.form, height }),
        value: input.form.height,
        label: input.ctx.t('app.height'),
        min: 3,
        max: 15,
        step: 1,
      }),
    ]),
  ])
}
