import { Drawer, DrawerHeader } from '~/@/ui'
import { CancelSubmitButtons } from '../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './props'

export const SurfaceLayoutMobile = (props: SurfaceLayoutProps) => {
  const Element = props.form ? 'form' : 'div'
  return (
    <Drawer
      id='surface-layout'
      onClose={props.onClose ?? (() => {})}
      open={props.open ?? false}
      position={props.position ?? 'bottom'}
      ctx={props.ctx}
      ariaLabel={props.ariaLabel}
    >
      <Element
        onSubmit={(e) => {
          e.preventDefault()
          props.form?.onSubmit?.()
        }}
        name={props.ariaLabel}
      >
        {props.header && (
          <DrawerHeader
            ctx={props.ctx}
            title={props.header?.title ?? null}
            onClose={props.header?.onClose ?? (() => {})}
          />
        )}
        <div className='flex w-full flex-1 flex-col'>{props.renderBody()}</div>
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
      </Element>
    </Drawer>
  )
}
