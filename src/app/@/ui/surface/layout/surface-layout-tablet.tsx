import { Dialog } from '~/@/ui'
import { DropDown } from '~/@/ui/drop-down/drop-down'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { Content } from './content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  const USE_DROP_DOWN = false
  if (props.anchor && USE_DROP_DOWN) {
    return (
      <DropDown
        open={props.open ?? false}
        onClose={props.onClose ?? (() => {})}
        renderReference={() => props.anchor}
        renderFloating={() => <Content {...props} />}
      />
    )
  }
  return (
    <>
      {props.anchor}
      <Dialog open={props.open ?? false} onClose={props.onClose ?? (() => {})}>
        <DialogSurface>
          <Content {...props} />
        </DialogSurface>
      </Dialog>
    </>
  )
}
