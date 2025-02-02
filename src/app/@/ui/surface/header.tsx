import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { preventConsoleErrorWhenClosingDrawer } from '~/@/ui/drawer/drawer-shared'
import { IconButton } from '~/@/ui/icon-button'
import { IconXMark } from '~/@/ui/icon/icon-x-mark'
import { Typography } from '~/@/ui/typography'

export const SurfaceHeader = (input: {
  ctx: { t: Translator }
  title: TranslatedText | null
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
