import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton, IconButtonEmpty } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'

export const ScreenNavBarMobile = (input: {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  ctx: {
    t: Translator
  }
  onBack?: (() => void) | false | null
}) => {
  if (!input.title && !input.subtitle && !input.onBack) return null

  return (
    <div className='flex h-20 w-full shrink-0 items-center truncate px-4 text-center'>
      {typeof input.onBack === 'function' && (
        <IconButton
          onClick={input.onBack}
          className='-ml-2'
          label={input.ctx.t('app.exit')}
          renderIcon={(inputIcon) => <IconArrowLeft {...inputIcon} />}
        />
      )}

      <div className='flex flex-1 flex-col truncate'>
        {typeof input.title === 'string' && (
          <Typography
            role='heading'
            sizeClassName='text-lg font-bold'
            className='truncate px-2'
            variant='title'
            text={input.title}
          />
        )}

        {typeof input.subtitle === 'string' && (
          <Typography
            className='text-secondary truncate px-2 text-xs'
            role='heading'
            variant='subtitle'
            text={input.subtitle}
          />
        )}
      </div>

      {typeof input.onBack === 'function' && <IconButtonEmpty />}
    </div>
  )
}
