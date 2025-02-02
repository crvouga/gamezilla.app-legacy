import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { type DrawerInput } from '~/@/ui/drawer'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'

export type SurfaceConfirmationProps = DrawerInput & {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  title: TranslatedText
  body: TranslatedText
  variant?: 'danger'
  //
  onClose: () => void
  //
  cancelText: TranslatedText
  cancelDisabled?: boolean
  onCancel: () => void
  //
  confirmText: TranslatedText
  onConfirm: () => void
  confirmLoading?: boolean
}

export const SurfaceConfirmation = (input: SurfaceConfirmationProps) => {
  return (
    <SurfaceLayout
      ctx={input.ctx}
      onClose={input.onClose}
      position='bottom'
      open={input.open}
      id='surface-confirmation'
      ariaLabel={input.title}
      header={{
        render: (props) => props.SurfaceHeader({ title: input.title, onClose: input.onClose }),
      }}
      form={{
        onSubmit: input.onConfirm,
        cancelText: input.cancelText,
        submitText: input.confirmText,
        onCancel: input.onCancel,
        cancelDisabled: input.cancelDisabled ?? false,
        submitLoading: input.confirmLoading ?? false,
        submitDisabled: false,
        variant: input.variant,
      }}
      body={{
        render: (props) => <props.SurfaceBodyText text={input.body} />,
      }}
    />
  )
}
