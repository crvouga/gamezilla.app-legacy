import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { DrawerInput } from '~/@/ui/surface-drawer'
import { DrawerPosition } from '~/@/ui/surface-drawer/drawer-position'
import { SurfaceBodyText } from '~/@/ui/surface/surface-body-text'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { h } from '~/@/vdom/h'
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
  dropDown?: DropDownConfig
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
  //
  testId?: string
}

export type SurfaceConfirmationProps = DrawerInput & PropsBase

export const SurfaceConfirmation = (input: SurfaceConfirmationProps) => {
  return h(SurfaceLayout, {
    ...input,
    id: 'surface-confirmation',
    ariaLabel: input.title,
    testId: input.testId,
    header: {
      render: () =>
        h(SurfaceHeader, {
          ctx: input.ctx,
          title: input.title,
          onClose: input.onClose,
        }),
    },
    form: {
      onSubmit: input.onConfirm,
      cancelText: input.cancelText,
      submitText: input.confirmText,
      onCancel: input.onCancel,
      cancelDisabled: input.cancelDisabled ?? false,
      submitLoading: input.confirmLoading ?? false,
      submitDisabled: false,
      variant: input.variant,
    },
    body: {
      render: () =>
        h(SurfaceBodyText, {
          text: input.body,
        }),
    },
  })
}
