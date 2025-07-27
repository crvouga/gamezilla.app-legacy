import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui/cn'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import type { VDom } from '~/@/vdom/vdom'
import { Gutter } from '../gutter'
import { Surface } from '../surface'
import type { DrawerProps, DrawerPropsPrivate } from './drawer-shared'
import { preventConsoleErrorWhenClosingDrawer } from './drawer-shared'
import { Pressable } from '~/@/vdom/primitives/pressable'

export type DrawerInput = DrawerPropsPrivate & {
  children: VDom[]
  ariaLabel: TranslatedText
  ctx: {
    t: Translator
  }
  testId?: string
}

export const Drawer = (props: DrawerProps) => {
  return h(
    Box,
    {
      id: props.id,
      'aria-hidden': props.open ? 'false' : 'true',
      'data-testid': props.testId,
      role: 'dialog',
      'aria-label': props.ariaLabel,
      class: cn(
        'absolute inset-0 z-50 flex flex-col bg-black/80 transition-opacity duration-200',
        props.position === 'bottom' ? 'flex-col' : 'flex-col-reverse',
        props.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ),
    },
    [
      h(Pressable, {
        class: 'w-full flex-1',
        'aria-label': props.ctx.t('drawer.close'),
        onPress: (event: unknown) => {
          preventConsoleErrorWhenClosingDrawer(event)
          props.onClose()
        },
      }),
      h(
        Surface,
        {
          class: cn(
            'h-fit w-full transition-transform duration-200',
            props.position === 'bottom'
              ? `rounded-t-2xl ${props.open ? 'translate-y-0' : 'translate-y-full'}`
              : `rounded-b-2xl ${props.open ? 'translate-y-0' : '-translate-y-full'}`,
          ),
        },
        [
          props.position === 'top' && h(Gutter, { variant: 'drawer' }),
          ...(Array.isArray(props.children) ? props.children : [props.children]),
          props.position === 'bottom' && h(Gutter, { variant: 'drawer' }),
        ],
      ),
    ],
  )
}
