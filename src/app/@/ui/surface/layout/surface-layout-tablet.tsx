import { Dialog } from '~/@/ui'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './surface-layout-props'
import { DialogBody } from '~/@/ui/dialog/dialog-body'
import { DialogHeader } from '~/@/ui/dialog/dialog-header'
import { DialogSurface } from '~/@/ui/dialog/dialog-surface'

export const SurfaceLayoutTablet = (props: SurfaceLayoutProps) => {
  return (
    <Dialog open={props.open ?? false} onClose={props.onClose ?? (() => {})}>
      <DialogSurface>
        <DynamicElement
          element='form'
          onSubmit={(e) => {
            e.preventDefault()
            props.form?.onSubmit?.()
          }}
          name={props.ariaLabel}
        >
          <div className='flex w-full flex-col'>
            {props.header && <DialogHeader title={props.header.title} />}
            {props.body?.render && <DialogBody>{props.body.render()}</DialogBody>}
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
      </DialogSurface>
    </Dialog>
  )
}
