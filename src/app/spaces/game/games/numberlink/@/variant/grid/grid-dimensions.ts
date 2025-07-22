import { Translator } from '~/@/l18n/generated'
import { TranslatedText } from '~/@/l18n/translations'
import { Box } from '~/@/vdom/primitives/box'
import { s } from '~/@/schema'
import { IconXMark } from '~/@/ui/icon'
import { ChipSelection } from '~/@/ui/chip-selection'
import { h } from '~/@/vdom/h'
import { Text } from '~/@/vdom/primitives/text'

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
  return h(Box, { class: 'flex flex-col gap-4 p-6' }, [
    h(Box, { class: 'flex items-center justify-center gap-1 text-center text-4xl font-bold' }, [
      h(Box, {}, [Text({ text: `${input.form.width}w` })]),

      h(IconXMark, { class: 'size-6' }),

      h(Box, {}, [Text({ text: `${input.form.height}h` })]),
    ]),

    h(Box, { class: 'flex flex-col gap-3' }, [
      h(ChipSelection<number>, {
        label: input.ctx.t('app.width'),
        options: Array.from({ length: 13 }, (_, i) => ({
          value: i + 3,
          label: TranslatedText.of(`${i + 3}`),
        })),
        value: input.form.width,
        onChange: (width) => input.onInput({ ...input.form, width }),
      }),
      h(ChipSelection<number>, {
        label: input.ctx.t('app.height'),
        options: Array.from({ length: 13 }, (_, i) => ({
          value: i + 3,
          label: TranslatedText.of(`${i + 3}`),
        })),
        value: input.form.height,
        onChange: (height) => input.onInput({ ...input.form, height }),
      }),
    ]),
  ])
}
