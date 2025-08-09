import { Drawer } from '~/@/ui/surface-drawer/drawer'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
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
      [h(SurfaceContent, props)],
    ),
  ])
}
