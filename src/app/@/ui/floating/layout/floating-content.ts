import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { sx } from '~/@/vdom/style/sx'
import { CancelSubmitButtons } from '../../form/cancel-submit-buttons'
import { FloatingLayoutProps } from './floating-layout-props'

export const FloatingContent = (props: FloatingLayoutProps) => {
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
