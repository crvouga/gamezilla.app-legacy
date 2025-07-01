import { Frag } from '~/@/ui/frag'
import { Drawer } from '~/@/ui/surface-drawer/drawer'
import { v } from '~/@/vdom/v'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  return v(Frag, {}, [
    props.dropDown?.reference,
    v(
      Drawer,
      {
        id: 'surface-layout',
        onClose: props.onClose ?? (() => {}),
        open: props.open ?? false,
        position: props.drawer?.position ?? 'bottom',
        ctx: props.ctx,
        ariaLabel: props.ariaLabel,
      },
      [v(SurfaceContent, props)],
    ),
  ])
}
