import { Dialog } from '~/@/ui'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { DialogSurface } from '~/@/ui/surface-dialog/dialog-surface'
import { SurfaceBody } from '~/@/ui/surface/surface-body'
import { SurfaceBodyText } from '../../../../../@/ui/surface/surface-body-text'
import { SurfaceHeader } from '../../../../../@/ui/surface/surface-header'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './surface-layout-props'

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
          {props.header?.render?.({
            SurfaceHeader: (input) => <SurfaceHeader ctx={props.ctx} title={input.title} onClose={input.onClose} />,
          })}
          {props.body?.render?.({
            SurfaceBody: (props) => <SurfaceBody>{props.children}</SurfaceBody>,
            SurfaceBodyText: (props) => <SurfaceBodyText text={props.text} />,
          })}
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
