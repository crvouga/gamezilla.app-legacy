import { Translator } from '~/@/l18n/generated'
import { TranslatedText } from '~/@/l18n/translations'
import { s } from '~/@/schema'
import { ChipSelection } from '~/@/ui/chip-selection'
import { IconXMark } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { theme } from '~/@/ui/theme/theme'

const schema = s.obj({
  t: s.l('grid'),
  width: s.num(),
  height: s.num(),
})

export type VariantGridDimensions = s.Infer<typeof schema>

const init = (model: { width: number; height: number }): VariantGridDimensions => {
  return {
    t: 'grid',
    width: model.width,
    height: model.height,
  }
}

const ViewForm = (input: {
  form: VariantGridDimensions
  onInput: (dimensions: VariantGridDimensions) => void
  ctx: {
    t: Translator
  }
}) => {
  return h(Box, { style: theme({ flexDirection: 'col', gap: 4, padding: 6 }) }, [
    h(Box, { style: theme({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }) }, [
      h(Box, {}, [h(Text, { text: `${input.form.width}w` })]),

      h(IconXMark, { style: theme({ size: 6 }) }),

      h(Box, {}, [h(Text, { text: `${input.form.height}h` })]),
    ]),

    h(Box, { style: theme({ flexDirection: 'col', gap: 3 }) }, [
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

export const VariantGridDimensions = {
  schema,
  init,
  ViewForm,
}
