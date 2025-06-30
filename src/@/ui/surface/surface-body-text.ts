import { h } from 'preact'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { SurfaceBody } from './surface-body'

export const SurfaceBodyText = (input: { text: TranslatedText }) => {
  return h(SurfaceBody, null, h(Typography, { variant: 'body', text: input.text, color: 'text-secondary' }))
}
