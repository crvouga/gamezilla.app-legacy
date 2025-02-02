import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { SurfaceBody } from './surface-body'

export const SurfaceBodyText = (input: { text: TranslatedText }) => {
  return (
    <SurfaceBody>
      <Typography variant='body' text={input.text} />
    </SurfaceBody>
  )
}
