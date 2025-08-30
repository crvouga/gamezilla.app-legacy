import { Drawer } from '~/@/ui/surface-drawer/drawer'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { FloatingContent } from './floating-content'
import { FloatingLayoutProps } from './floating-layout-props'

export const FloatingLayoutMobile = (props: FloatingLayoutProps) => {
  return h(Frag, {}, [
    props.dropDown?.reference?.render?.(),
    h(
      Drawer,
      {
        id: 'surface-layout',
        onClose: props.onClose ?? (() => {}),
        open: props.open ?? false,
        position: props.drawer?.position ?? 'bottom',
        ctx: props.ctx,
        ariaLabel: props.ariaLabel,
      },
      [h(FloatingContent, props)],
    ),
  ])
}
