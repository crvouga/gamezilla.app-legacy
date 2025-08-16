import { Translator } from '~/@/l18n/generated'
import { TranslatedText } from '~/@/l18n/translations'
import { s } from '~/@/schema'
import { ChipSelection } from '~/@/ui/chip-selection'
import { IconXMark } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { sx } from '~/@/vdom/style/sx'

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

const ViewForm = (props: {
  form: VariantGridDimensions
  onInput: (dimensions: VariantGridDimensions) => void
  ctx: {
    t: Translator
  }
}) => {
  return h(Box, { style: sx({ flexDirection: 'col', gap: 4, padding: 6 }) }, [
    h(Box, { style: sx({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }) }, [
      h(Box, {}, [h(Text, { text: `${props.form.width}w`, style: sx({ textColor: 'white', fontSize: '3xl' }) })]),

      h(IconXMark, { style: sx({ size: 6 }) }),

      h(Box, {}, [h(Text, { text: `${props.form.height}h`, style: sx({ textColor: 'white', fontSize: '3xl' }) })]),
    ]),

    h(Box, { style: sx({ flexDirection: 'col', gap: 6 }) }, [
      h(ChipSelection<number>, {
        label: props.ctx.t('app.width'),
        options: Array.from({ length: 13 }, (_, i) => ({
          value: i + 3,
          label: TranslatedText.of(`${i + 3}`),
        })),
        value: props.form.width,
        onChange: (width) => props.onInput({ ...props.form, width }),
      }),
      h(ChipSelection<number>, {
        label: props.ctx.t('app.height'),
        options: Array.from({ length: 13 }, (_, i) => ({
          value: i + 3,
          label: TranslatedText.of(`${i + 3}`),
        })),
        value: props.form.height,
        onChange: (height) => props.onInput({ ...props.form, height }),
      }),
    ]),
  ])
}

export const VariantGridDimensions = {
  schema,
  init,
  ViewForm,
}
