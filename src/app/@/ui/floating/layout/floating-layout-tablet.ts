import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DropDownSurface } from '~/@/ui/drop-down/drop-down-surface'
import { Dialog } from '~/@/ui/surface-dialog/dialog'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { h } from '~/@/vdom/h'
import { Frag } from '~/@/vdom/primitives/frag'
import { FloatingContent } from './floating-content'
import { FloatingLayoutProps } from './floating-layout-props'

export const FloatingLayoutTablet = (props: FloatingLayoutProps) => {
  if (props.dropDown?.reference) {
    return h(DropDown, {
      ...props,
      id: `${props.id}--drop-down`,
      open: props.open,
      onClose: props.onClose,
      renderReference: () => props.dropDown?.reference?.render?.(),
      alignment: props.dropDown?.alignment ?? 'ending',
      position: props.dropDown?.position ?? 'bottom',
      renderFloating: () => h(DropDownSurface, {}, [h(FloatingContent, props)]),
    })
  }

  return h(Frag, {}, [
    props.dropDown?.reference?.render?.(),
    h(
      Dialog,
      {
        ...props,
        open: props.open,
        onClose: props.onClose,
      },
      [h(DialogSurface, {}, [h(FloatingContent, props)])],
    ),
  ])
}
