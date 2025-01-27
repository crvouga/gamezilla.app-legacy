import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'

export const ScreenNavBarTablet = (input: {
  title: TranslatedText
  subtitle?: TranslatedText | null
  ctx: {
    t: Translator
  }
  onBack?: (() => void) | false | null
}) => {
  return (
    <div className='flex h-16 w-full shrink-0 items-center truncate px-4'>
      {input.onBack && (
        <IconButton
          onClick={input.onBack}
          className='-ml-2'
          label={input.ctx.t('app.exit')}
          renderIcon={(inputIcon) => <IconArrowLeft {...inputIcon} />}
        />
      )}

      <div className='flex flex-1 flex-col truncate'>
        <Typography role='heading' className='truncate px-2 text-2xl font-bold' variant='title' text={input.title} />

        {input.subtitle && (
          <Typography
            className='text-secondary truncate px-2 text-sm'
            role='heading'
            variant='subtitle'
            text={input.subtitle}
          />
        )}
      </div>
    </div>
  )
}
