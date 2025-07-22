import { Translator } from '~/@/l18n/generated'
import { Box } from '~/@/vdom/box'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
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
      class: cn('flex h-full flex-col items-center', input.center ? 'justify-center' : 'justify-start'),
    },
    [h(Box, { class: 'flex w-full max-w-xl flex-col items-center justify-center gap-4 p-6' }, input.children)],
  )
}
