import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { type DrawerInput } from '~/@/ui/surface-drawer'
import { SurfaceBodyText } from '~/@/ui/surface/surface-body-text'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'

export type SurfaceConfirmationProps = DrawerInput & {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  drawer?: {
    position?: DrawerPosition
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
      open={input.open}
      id='surface-confirmation'
      ariaLabel={input.title}
      header={{
        render: () => <SurfaceHeader ctx={input.ctx} title={input.title} onClose={input.onClose} />,
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
        render: () => <SurfaceBodyText text={input.body} />,
      }}
    />
  )
}
