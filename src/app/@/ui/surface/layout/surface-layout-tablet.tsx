import { Dialog } from '~/@/ui'
import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DropDownSurface } from '~/@/ui/drop-down/drop-down-surface'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { Content } from './content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  if (props.anchor) {
    return (
      <DropDown
        id={`${props.id}-drop-down`}
        open={props.open}
        onClose={props.onClose}
        renderReference={() => props.anchor}
        alignment={props.dropDown?.alignment ?? 'ending'}
        position={props.dropDown?.position ?? 'bottom'}
        renderFloating={() => (
          <DropDownSurface>
            <Content {...props} />
          </DropDownSurface>
        )}
      />
    )
  }
  return (
    <>
      {props.anchor}
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogSurface>
          <Content {...props} />
        </DialogSurface>
      </Dialog>
    </>
  )
}
