import { TranslatedText } from '~/@/l18n'
import { Button } from './button'
import { preventConsoleErrorWhenClosingDrawer } from './drawer'

export const FormBottomButtons = (input: {
  onCancel: () => void
  cancelText: TranslatedText
  cancelDisabled?: boolean
  submitText: TranslatedText
  submitLoading?: boolean
  submitDisabled?: boolean
  variant?: 'danger'
}) => {
  return (
    <div className='flex w-full items-center gap-4 p-4'>
      <Button
        className='flex-1'
        onClick={(event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onCancel()
        }}
        text={input.cancelText}
        disabled={input.cancelDisabled}
      />
      <Button
        className='flex-1'
        type='submit'
        color={input.variant === 'danger' ? 'danger' : 'default'}
        variant='contained'
        text={input.submitText}
        loading={input.submitLoading}
        disabled={input.submitDisabled}
      />
    </div>
  )
}
