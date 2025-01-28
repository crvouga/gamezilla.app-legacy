import { Drawer, DrawerHeader } from '~/@/ui'
import { SurfaceLayoutProps } from './props'
import { ViewForm } from '../form'
import { FormButtons } from '../form-buttons'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  return (
    <Drawer
      id='surface-layout'
      onClose={props.onClose ?? (() => {})}
      open={props.open ?? false}
      position='bottom'
      ctx={props.ctx}
      ariaLabel={props.ariaLabel}
    >
      <ViewForm onSubmit={props.form?.onSubmit ?? (() => {})} name={props.ariaLabel}>
        {props.header && (
          <DrawerHeader
            ctx={props.ctx}
            title={props.header?.title ?? null}
            onClose={props.header?.onClose ?? (() => {})}
          />
        )}
        <div className='flex w-full flex-1 flex-col p-6'>{props.renderBody()}</div>
        <FormButtons
          cancelText={props.form?.cancelText ?? props.ctx.t('app.cancel')}
          onCancel={props.form?.onCancel ?? (() => {})}
          submitText={props.form?.submitText ?? props.ctx.t('app.submit')}
          submitLoading={props.form?.submitLoading ?? false}
          submitDisabled={props.form?.submitDisabled ?? false}
          cancelDisabled={props.form?.cancelDisabled ?? false}
        />
      </ViewForm>
    </Drawer>
  )
}
