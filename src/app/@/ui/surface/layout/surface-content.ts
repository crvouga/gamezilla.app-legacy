import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './surface-layout-props'

export const SurfaceContent = (props: SurfaceLayoutProps) => {
  return h(Box, { name: props.ariaLabel }, [
    props.header?.render?.(),
    props.body?.render?.(),
    props.form &&
      h(CancelSubmitButtons, {
        variant: props.form?.variant,
        cancelText: props.form?.cancelText ?? props.ctx.t('app.cancel'),
        onCancel: props.form?.onCancel ?? (() => {}),
        submitText: props.form?.submitText ?? props.ctx.t('app.submit'),
        onSubmit: props.form?.onSubmit ?? (() => {}),
        submitLoading: props.form?.submitLoading ?? false,
        submitDisabled: props.form?.submitDisabled ?? false,
        cancelDisabled: props.form?.cancelDisabled ?? false,
      }),
  ])
}
