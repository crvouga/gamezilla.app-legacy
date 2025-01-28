import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Drawer, DrawerHeader, type DrawerInput } from '~/@/ui/drawer'
import { Typography } from '~/@/ui/typography'
import { ViewForm } from './form'
import { FormButtons } from './form-buttons'

type input = DrawerInput & {
  ctx: {
    t: Translator
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

export const ConfirmationFormDrawer = (input: input) => {
  return (
    <Drawer {...input}>
      <ViewForm name={input.title} onSubmit={input.onConfirm}>
        <DrawerHeader title={input.title} ctx={input.ctx} onClose={input.onClose} />

        <Typography className='p-4' variant='body' text={input.body} />

        <FormButtons
          cancelText={input.cancelText}
          submitText={input.confirmText}
          onCancel={input.onCancel}
          cancelDisabled={input.cancelDisabled}
          submitLoading={input.confirmLoading}
          variant={input.variant}
        />
      </ViewForm>
    </Drawer>
  )
}
