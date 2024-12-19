import type { VDom } from '~/@/vdom'
import { Button } from './button'
import { cn } from './cn'
import { TranslatedText } from '~/@/l18n'
import { Typography } from './typography'

export const ConfirmationDialog = ({
  open,
  onCancel,
  onClose,
  onConfirm,
  title,
  confirmTitle,
  cancelTitle
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onConfirm: () => void
  title: TranslatedText
  subtitle?: TranslatedText
  confirmTitle: TranslatedText
  cancelTitle?: TranslatedText
  headerIcon?: VDom
}) => {
  return (
    <div
      className={cn('absolute left-0 top-0 grid h-full w-full place-items-center', open ? 'block' : 'hidden')}
      onClick={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        onClose()
      }}
    >
      <div className='flex w-80 flex-col gap-6 rounded-lg bg-black p-6'>
        <Typography variant='title' text={title} />

        <div className='flex w-full items-center gap-4'>
          <Button
            variant='outlined'
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
            className='flex-1'
            text={cancelTitle}
          />

          <Button
            variant='contained'
            color='danger'
            onClick={(e) => {
              e.stopPropagation()
              onConfirm()
            }}
            className='flex-1'
            text={confirmTitle}
          />
        </div>
      </div>
    </div>
  )
}
