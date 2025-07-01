import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DropDownSurface } from '~/@/ui/drop-down/drop-down-surface'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { h } from '~/@/vdom/h'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  if (props.dropDown?.reference) {
    return h(DropDown, {
      id: `${props.id}-drop-down`,
      open: props.open,
      onClose: props.onClose,
      renderReference: () => props.dropDown?.reference,
      alignment: props.dropDown?.alignment ?? 'ending',
      position: props.dropDown?.position ?? 'bottom',
      renderFloating: () => h(DropDownSurface, {}, [h(SurfaceContent, props)]),
    })
  }

  return h('div', {}, [
    props.dropDown?.reference,
    h(
      Dialog,
      {
        open: props.open,
        onClose: props.onClose,
      },
      [h(DialogSurface, {}, [h(SurfaceContent, props)])],
    ),
  ])
}
