import { Drawer, DrawerHeader } from '~/@/ui'
import { DrawerBody } from '~/@/ui/drawer/drawer-body'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  return (
    <Drawer
      id='surface-layout'
      onClose={props.onClose ?? (() => {})}
      open={props.open ?? false}
      position={props.position ?? 'bottom'}
      ctx={props.ctx}
      ariaLabel={props.ariaLabel}
    >
      <DynamicElement
        element='form'
        onSubmit={(e) => {
          e.preventDefault()
          props.form?.onSubmit?.()
        }}
        name={props.ariaLabel}
      >
        <div className='flex w-full flex-col gap-4 p-6 pb-2'>
          {props.header && (
            <DrawerHeader
              ctx={props.ctx}
              title={props.header?.title ?? null}
              onClose={props.header?.onClose ?? (() => {})}
            />
          )}
          {props.body?.render && <DrawerBody>{props.body.render()}</DrawerBody>}
        </div>
        {props.form && (
          <CancelSubmitButtons
            variant={props.form?.variant}
            cancelText={props.form?.cancelText ?? props.ctx.t('app.cancel')}
            onCancel={props.form?.onCancel ?? (() => {})}
            submitText={props.form?.submitText ?? props.ctx.t('app.submit')}
            submitLoading={props.form?.submitLoading ?? false}
            submitDisabled={props.form?.submitDisabled ?? false}
            cancelDisabled={props.form?.cancelDisabled ?? false}
          />
        )}
      </DynamicElement>
    </Drawer>
  )
}
