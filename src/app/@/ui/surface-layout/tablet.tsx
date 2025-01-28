import { Dialog, DialogHeader, DialogSurface } from '~/@/ui'
import { CancelSubmitButtons } from '../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './props'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  const Element = props.form ? 'form' : 'div'
  return (
    <Dialog open={props.open ?? false} onClose={props.onClose ?? (() => {})}>
      <DialogSurface>
        <Element
          onSubmit={(e) => {
            e.preventDefault()
            props.form?.onSubmit?.()
          }}
          name={props.ariaLabel}
        >
          {props.header && <DialogHeader title={props.header.title} />}
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
      </DialogSurface>
    </Dialog>
  )
}
