import { TranslatedText } from '~/@/l18n'
import { Button } from './button'

export const FormBottomButtons = (input: {
  onCancel: () => void
  cancelText: TranslatedText
  cancelDisabled?: boolean
  confirmText: TranslatedText
  confirmLoading?: boolean
  confirmDisabled?: boolean
  variant?: 'danger'
}) => {
  return (
    <div className='flex w-full items-center gap-4 p-4'>
      <Button className='flex-1' onClick={input.onCancel} text={input.cancelText} disabled={input.cancelDisabled} />
      <Button
        className='flex-1'
        type='submit'
        color={input.variant === 'danger' ? 'danger' : 'default'}
        variant='contained'
        text={input.confirmText}
        loading={input.confirmLoading}
        disabled={input.confirmDisabled}
      />
    </div>
  )
}
