import { Translator } from '~/@/l18n/generated'
import { IconButton } from '../icon-button'
import { IconXMark } from '../icon/icon-x-mark'
import { TranslatedText } from '~/@/l18n'
import { Typography } from '../typography'

export const DrawerHeader = (input: { ctx: { t: Translator }; title: TranslatedText | null; onClose?: () => void }) => {
  return (
    <div className='flex w-full items-center px-4 pb-2 pt-4'>
      <div className='flex-1'>{input.title && <Typography text={input.title} variant='title' />}</div>
      <IconButton
        label={input.ctx.t('drawer.close')}
        onClick={input.onClose}
        className='-mr-1'
        renderIcon={(inputIcon) => <IconXMark {...inputIcon} />}
      />
    </div>
  )
}
