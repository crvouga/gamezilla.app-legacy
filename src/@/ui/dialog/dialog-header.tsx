import { TranslatedText } from '~/@/l18n'
import { Typography } from '../typography'
import { IconXMark } from '../icon/icon-x-mark'
import { preventConsoleErrorWhenClosingDrawer } from '../drawer/drawer-shared'
import { IconButton } from '../icon-button'
import { Translator } from '~/@/l18n/generated'

export const DialogHeader = (input: {
  ctx: {
    t: Translator
  }
  title: TranslatedText
  onClose?: () => void
}) => {
  return (
    <div className='flex w-full items-center justify-center px-6 pb-0 pt-4'>
      <div className='flex-1'>
        {input.title && <Typography text={input.title} variant='title' sizeClassName='text-2xl' />}
      </div>
      <IconButton
        label={input.ctx.t('app.close')}
        onClick={(event) => {
          preventConsoleErrorWhenClosingDrawer(event)
          input.onClose?.()
        }}
        className='-mr-1'
        renderIcon={(inputIcon) => <IconXMark {...inputIcon} />}
      />
    </div>
  )
}
