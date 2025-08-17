import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { SafeAreaBox } from '~/@/vdom/primitives/safe-area-box'
import type { VDom } from '~/@/vdom/vdom'
import { sx } from '../../vdom/style/sx'
import type { DrawerProps, DrawerPropsPrivate } from './drawer-shared'

export type DrawerInput = DrawerPropsPrivate & {
  children: VDom[]
  ariaLabel: TranslatedText
  ctx: {
    t: Translator
  }
  testId?: string
}

const DrawerContent = (props: { position: 'top' | 'bottom'; open: boolean; children: VDom[] }) => {
  const isTop = props.position === 'top'
  return h(
    SafeAreaBox,
    {
      edges: isTop ? ['top'] : ['bottom'],
      style: sx({
        transform: [{ translateY: props.open ? 0 : isTop ? '-100%' : '100%' }],
        width: 'full',
        rounded: 'lg',
        flexDirection: 'col',
        backgroundColor: 'black',
        borderWidth: 2,
        borderColor: 'neutral-700',
      }),
    },
    props.children,
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
      style: sx({
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        flexDirection: 'col',
        backgroundColor: 'black/80',
        opacity: props.open ? 100 : 0,
        pointerEvents: props.open ? 'auto' : 'none',
      }),
    },
    [
      props.position === 'top' && h(DrawerContent, { position: 'top', open: props.open }, props.children),
      h(Pressable, {
        style: sx({
          width: 'full',
          flex: 1,
          zIndex: 50,
        }),
        'aria-label': props.ctx.t('drawer.close'),
        onPress: props.onClose,
      }),
      props.position === 'bottom' && h(DrawerContent, { position: 'bottom', open: props.open }, props.children),
    ],
  )
}
