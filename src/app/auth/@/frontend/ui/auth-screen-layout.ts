import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui/cn'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { Frag } from '~/@/ui/frag'
import { h } from '~/@/vdom/h'

export const AuthScreenLayout = (input: {
  dataTestId: string
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  children: VDom
  center: boolean
}) => {
  return h('div', {
    'data-testid': input.dataTestId,
    class: cn('flex h-full flex-col items-center', input.center ? 'justify-center' : 'justify-start'),
    children: h(Frag, {}, [
      h('div', {
        class: 'flex w-full max-w-xl flex-col items-center justify-center gap-4 p-6',
        children: input.children,
      }),
    ]),
  })
}
