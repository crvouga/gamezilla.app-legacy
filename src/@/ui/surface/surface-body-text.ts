import { v } from '~/@/vdom/v'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { SurfaceBody } from './surface-body'

export const SurfaceBodyText = (input: { text: TranslatedText }) => {
  return v(SurfaceBody, {}, [v(Typography, { variant: 'body', text: input.text, color: 'text-secondary' })])
}
