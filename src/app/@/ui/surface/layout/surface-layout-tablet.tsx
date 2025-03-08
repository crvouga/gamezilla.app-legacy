import { Dialog } from '~/@/ui'
import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DropDownSurface } from '~/@/ui/drop-down/drop-down-surface'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  if (props.dropDownReference) {
    return (
      <DropDown
        id={`${props.id}-drop-down`}
        open={props.open}
        onClose={props.onClose}
        renderReference={() => props.dropDownReference}
        alignment={props.dropDown?.alignment ?? 'ending'}
        position={props.dropDown?.position ?? 'bottom'}
        renderFloating={() => (
          <DropDownSurface>
            <SurfaceContent {...props} />
          </DropDownSurface>
        )}
      />
    )
  }
  return (
    <>
      {props.dropDownReference}
      <Dialog open={props.open} onClose={props.onClose}>
        <DialogSurface>
          <SurfaceContent {...props} />
        </DialogSurface>
      </Dialog>
    </>
  )
}
