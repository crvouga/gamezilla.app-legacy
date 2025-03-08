import { Drawer } from '~/@/ui'
import { SurfaceContent } from './surface-content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  return (
    <>
      {props.dropDownReference}
      <Drawer
        id='surface-layout'
        onClose={props.onClose ?? (() => {})}
        open={props.open ?? false}
        position={props.drawer?.position ?? 'bottom'}
        ctx={props.ctx}
        ariaLabel={props.ariaLabel}
      >
        <SurfaceContent {...props} />
      </Drawer>
    </>
  )
}
