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

const DrawerContent = (props: { position: 'top' | 'bottom'; open: boolean; children: VDom | VDom[] }) => {
  const isTop = props.position === 'top'
  return h(
    Surface,
    {
      class: cn(
        'w-full transition-transform duration-200',
        isTop ? 'rounded-b-2xl' : 'rounded-t-2xl',
        props.open ? 'translate-y-0' : isTop ? '-translate-y-full' : 'translate-y-full',
      ),
    },
    [
      ...(isTop ? [h(Gutter, { variant: 'drawer' })] : []),
      ...(Array.isArray(props.children) ? props.children : [props.children]),
      ...(!isTop ? [h(Gutter, { variant: 'drawer' })] : []),
    ],
  )
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
        'absolute inset-0 z-50 flex bg-black/80 transition-opacity duration-200 flex-col',
        props.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ),
    },
    [
      props.position === 'top' && h(DrawerContent, { position: 'top', open: props.open }, props.children),
      h(Pressable, {
        class: 'w-full flex-1 z-50',
        'aria-label': props.ctx.t('drawer.close'),
        onPress: (event: unknown) => {
          preventConsoleErrorWhenClosingDrawer(event)
          props.onClose()
        },
      }),
      props.position === 'bottom' && h(DrawerContent, { position: 'bottom', open: props.open }, props.children),
    ],
  )
}
