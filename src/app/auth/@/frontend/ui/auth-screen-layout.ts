import { Translator } from '~/@/l18n/generated'
import { sx } from '~/@/ui/theme/theme'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export const AuthScreenLayout = (input: {
  testId: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  children: VDom[]
  center: boolean
}) => {
  return h(
    Box,
    {
      'data-testid': input.testId,
      style: sx({
        flexDirection: 'col',
        width: 'full',
        maxWidth: '7xl',
        alignItems: 'center',
        justifyContent: input.center ? 'center' : 'flex-start',
      }),
    },
    [
      h(
        Box,
        {
          style: sx({
            flexDirection: 'col',
            width: 'full',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: 6,
          }),
        },
        input.children,
      ),
    ],
  )
}
