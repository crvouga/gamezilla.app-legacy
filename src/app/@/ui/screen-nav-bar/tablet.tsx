import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui/cn'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton, IconButtonEmpty } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'

export const ScreenNavBarTablet = (input: {
  title: TranslatedText
  subtitle?: TranslatedText | null
  // center?: boolean
  ctx: {
    t: Translator
  }
  onBack?: (() => void) | false | null
}) => {
  const isCenter = true
  return (
    <div className={cn('flex h-16 w-full shrink-0 items-center truncate px-4', isCenter && 'text-center')}>
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
