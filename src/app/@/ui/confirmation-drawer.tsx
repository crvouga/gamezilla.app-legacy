import { TranslatedText } from '~/@/l18n'
import { Button } from './button'
import { Drawer, type DrawerInput } from './drawer'
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

        <div className='flex w-full items-center gap-4 p-4'>
          <Button
            className='flex-1'
            onClick={input.onCancel}
            text={input.cancelText ?? 'Cancel'}
            disabled={input.cancelDisabled}
          />
          <Button
            className='flex-1'
            type='submit'
            color={input.variant === 'danger' ? 'danger' : 'default'}
            variant='contained'
            text={input.confirmText}
            loading={input.confirmLoading}
          />
        </div>
      </form>
    </Drawer>
  )
}
