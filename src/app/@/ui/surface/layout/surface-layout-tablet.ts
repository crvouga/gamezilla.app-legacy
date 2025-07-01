import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DropDownSurface } from '~/@/ui/drop-down/drop-down-surface'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { v } from '~/@/vdom/v'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  if (props.dropDown?.reference) {
    return v(DropDown, {
      id: `${props.id}-drop-down`,
      open: props.open,
      onClose: props.onClose,
      renderReference: () => props.dropDown?.reference,
      alignment: props.dropDown?.alignment ?? 'ending',
      position: props.dropDown?.position ?? 'bottom',
      renderFloating: () => v(DropDownSurface, null, [v(SurfaceContent, props)]),
    })
  }

  return v('div', null, [
    props.dropDown?.reference,
    v(
      Dialog,
      {
        open: props.open,
        onClose: props.onClose,
      },
      [v(DialogSurface, null, [v(SurfaceContent, props)])],
    ),
  ])
}
