import { Drawer } from '~/@/ui'
import { Content } from './content'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  return (
    <>
      {props.anchor}
      <Drawer
        id='surface-layout'
        onClose={props.onClose ?? (() => {})}
        open={props.open ?? false}
        position={props.position ?? 'bottom'}
        ctx={props.ctx}
        ariaLabel={props.ariaLabel}
      >
        <Content {...props} />
      </Drawer>
    </>
  )
}
