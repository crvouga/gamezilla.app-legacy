import { TranslatedText } from '~/@/l18n'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Text } from '~/@/vdom/primitives/text'
import { LOGO_TEXT } from './logo-text'

export const SPLASH_SCREEN_HTML = `
<div
  style="
    display: flex;
    height: 100vh;
    width: 100vw;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    margin: 0;
    padding: 0;
    overflow: hidden;
  "
>
  ${LOGO_TEXT}
</div>
`

export const SplashScreen = (input: { reason?: TranslatedText }) => {
  return h(
    Box,
    { class: 'fixed h-screen w-screen flex items-center justify-center text-[64px] m-0 p-0 overflow-hidden' },
    [
      Text({ text: LOGO_TEXT }),
      input.reason &&
        h(Typography, {
          text: input.reason,
          variant: 'caption',
          color: 'text-secondary',
        }),
    ].filter(Boolean),
  )
}
