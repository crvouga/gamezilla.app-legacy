import { TranslatedText } from '~/@/l18n'
import { Button, ButtonInput } from '~/@/ui/button'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/drawer/drawer-shared'

export const CancelSubmitButtons = (input: {
  onCancel: () => void
  cancelText: TranslatedText
  cancelDisabled?: boolean
  submitText: TranslatedText
  submitLoading?: boolean
  submitDisabled?: boolean
  variant?: 'danger'
  size?: ButtonInput['size']
}) => {
  return (
    <div className='flex w-full items-center gap-4 px-6 pb-6 pt-4'>
      <Button
        className='flex-1'
        size={input.size}
        onClick={(event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onCancel()
        }}
        text={input.cancelText}
        disabled={input.cancelDisabled}
      />
      <Button
        className='flex-1'
        size={input.size}
        type='submit'
        color={input.variant === 'danger' ? 'danger' : 'primary'}
        variant='contained'
        text={input.submitText}
        loading={input.submitLoading}
        disabled={input.submitDisabled}
      />
    </div>
  )
}
