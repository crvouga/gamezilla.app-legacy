import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import type { VDom } from '~/@/vdom/vdom'
import { Gutter } from '../gutter'
import { SURFACE_STYLE } from '../surface'
import { theme } from '../theme/theme'
import type { DrawerProps, DrawerPropsPrivate } from './drawer-shared'
import { preventConsoleErrorWhenClosingDrawer } from './drawer-shared'

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
    SafeAreaBox,
    {
      edges: isTop ? ['top'] : ['bottom'],
      style: {
        ...SURFACE_STYLE,
        width: 'full',
        transform: props.open ? 'translateY(0)' : isTop ? 'translateY(-100%)' : 'translateY(100%)',
        transitionProperty: 'transform',
        transitionDuration: '200ms',
        ...(isTop
          ? theme({
              rounded: 'lg',
            })
          : theme({
              rounded: 'lg',
            })),
      },
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
      'aria-hidden': !props.open,
      'data-testid': props.testId,
      role: 'dialog',
      'aria-label': props.ariaLabel,
      style: theme({
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        flexDirection: 'col',
        backgroundColor: 'black/80',
        // transitionProperty: 'opacity',
        // transitionDuration: '200ms',
        opacity: props.open ? 100 : 0,
        pointerEvents: props.open ? 'auto' : 'none',
      }),
    },
    [
      props.position === 'top' && h(DrawerContent, { position: 'top', open: props.open }, props.children),
      h(Pressable, {
        style: theme({
          width: 'full',
          flex: 1,
          zIndex: 50,
        }),
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
