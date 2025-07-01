import { h } from '~/@/vdom/h'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { SurfaceBody } from './surface-body'

export const SurfaceBodyText = (input: { text: TranslatedText }) => {
  return h(SurfaceBody, {}, [h(Typography, { variant: 'body', text: input.text, color: 'text-secondary' })])
}
