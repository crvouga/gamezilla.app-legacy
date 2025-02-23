import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { DrawerInput } from '~/@/ui'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { SurfaceBodyText } from '~/@/ui/surface/surface-body-text'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { SurfaceLayout } from '~/app/@/ui/surface/layout/surface-layout'

type PropsBase = {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  drawer?: {
    position?: DrawerPosition
  }
  title: TranslatedText
  body: TranslatedText
  dropDownReference?: VDom
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

export type SurfaceConfirmationProps = DrawerInput & PropsBase

export const SurfaceConfirmation = (input: SurfaceConfirmationProps) => {
  return (
    <SurfaceLayout
      {...input}
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
