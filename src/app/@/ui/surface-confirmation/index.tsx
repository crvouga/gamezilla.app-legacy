import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { type DrawerInput } from '~/@/ui/drawer'
import { ScreenSize } from '../../frontend/ctx'
import { SurfaceLayout } from '../surface-layout'
import { Typography } from '~/@/ui'

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
        title: input.title,
        onClose: input.onClose,
      }}
      form={{
        onSubmit: input.onConfirm,
        cancelText: input.cancelText,
        submitText: input.confirmText,
        onCancel: input.onCancel,
        cancelDisabled: input.cancelDisabled ?? false,
        submitLoading: input.confirmLoading ?? false,
        submitDisabled: false,
      }}
      renderBody={() => <Typography className='p-4' variant='body' text={input.body} />}
    />
  )
}
