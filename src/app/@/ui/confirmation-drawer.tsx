import { TranslatedText } from '~/@/l18n'
import { Drawer, type DrawerInput } from './drawer'
import { FormBottomButtons } from './form-button-buttons'
import { Typography } from './typography'

type input = DrawerInput & {
  title: TranslatedText
  body: TranslatedText
  variant?: 'danger'
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          input.onConfirm()
        }}
      >
        <Typography variant='title' className='w-full px-4 pt-4 text-left' text={input.title} />

        <Typography className='p-4' variant='body' text={input.body} />

        <FormBottomButtons
          cancelText={input.cancelText}
          confirmText={input.confirmText}
          onCancel={input.onCancel}
          cancelDisabled={input.cancelDisabled}
          confirmLoading={input.confirmLoading}
          variant={input.variant}
        />
      </form>
    </Drawer>
  )
}
