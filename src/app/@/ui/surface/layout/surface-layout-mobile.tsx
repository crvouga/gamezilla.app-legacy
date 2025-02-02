import { Drawer } from '~/@/ui'
import { DynamicElement } from '~/@/ui/dynamic-element'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceBodyText } from '../../../../../@/ui/surface/surface-body-text'
import { SurfaceHeader } from '../../../../../@/ui/surface/surface-header'
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
        {props.header?.render?.({
          SurfaceHeader: (input) => (
            <SurfaceHeader ctx={props.ctx} title={input.title ?? null} onClose={input.onClose} />
          ),
        })}

        {props.body?.render?.({
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
    </Drawer>
  )
}
