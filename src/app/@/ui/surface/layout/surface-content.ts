import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { SurfaceLayoutProps } from './surface-layout-props'
import { sx } from '~/@/ui/theme/theme'

export const SurfaceContent = (props: SurfaceLayoutProps) => {
  return h(Box, { 'aria-label': props.ariaLabel, style: sx({ flexDirection: 'col', width: 'full' }) }, [
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
