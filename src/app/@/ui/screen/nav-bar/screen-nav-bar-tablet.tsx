import type { TranslatedText } from '~/@/l18n'
import type { Translator } from '~/@/l18n/generated'
import { IconArrowLeft } from '~/@/ui/icon'
import { IconButton } from '~/@/ui/icon-button'
import { Typography } from '~/@/ui/typography'
import { VDom } from '~/@/vdom/vdom'

export const ScreenNavBarTablet = (input: {
  title?: TranslatedText | null
  subtitle?: TranslatedText | null
  ctx: {
    t: Translator
  }
  onBack?: (() => void) | false | null
  renderEnd?: () => VDom
}) => {
  return (
    <ScreenNavBarTabletRoot>
      {input.onBack && (
        <IconButton
          onClick={input.onBack}
          className='-ml-2'
          label={input.ctx.t('app.exit')}
          renderIcon={(inputIcon) => <IconArrowLeft {...inputIcon} />}
        />
      )}

      <div className='flex flex-1 flex-col truncate'>
        {input.title && (
          <Typography
            role='heading'
            className='truncate px-2'
            sizeClassName='text-3xl font-bold'
            variant='title'
            text={input.title}
          />
        )}
        {input.subtitle && (
          <Typography
            className='text-secondary truncate px-2'
            sizeClassName='text-xl'
            role='heading'
            variant='subtitle'
            text={input.subtitle}
          />
        )}
      </div>
      {input.renderEnd?.()}
    </ScreenNavBarTabletRoot>
  )
}

export const ScreenNavBarTabletRoot = (input: { children: VDom }) => {
  return <div className='flex h-24 w-full shrink-0 items-center truncate px-4'>{input.children}</div>
}
