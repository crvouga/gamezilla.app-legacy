import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { cn } from './cn'
import { IconButton, IconButtonEmpty } from './icon-button'
import { IconArrowLeft } from './icon'
import { Typography } from './typography'

export const TopBar = (input: {
  title: TranslatedText
  subtitle?: TranslatedText
  center?: boolean
  ctx: {
    t: Translator
  }
  onBack: (() => void) | false
}) => {
  const isCenter = input.center || true
  return (
    <div className={cn('flex h-16 w-full shrink-0 items-center truncate border-b  px-4', isCenter && 'text-center')}>
      {input.onBack && (
        <IconButton
          onClick={input.onBack}
          className='-ml-2'
          label={input.ctx.t('app.exit')}
          renderIcon={(inputIcon) => <IconArrowLeft {...inputIcon} />}
        />
      )}

      <div className='flex flex-1 flex-col truncate'>
        <Typography role='heading' className='truncate px-2 text-xl font-bold' variant='title' text={input.title} />

        {input.subtitle && (
          <Typography
            className='text-secondary truncate px-2 text-xs'
            role='heading'
            variant='subtitle'
            text={input.subtitle}
          />
        )}
      </div>

      {isCenter && input.onBack && <IconButtonEmpty />}
    </div>
  )
}
