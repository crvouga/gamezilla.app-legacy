import { ScreenLayoutMobile } from './screen-layout-mobile'
import { ScreenLayoutProps, toDataTestIds } from './screen-layout-props'
import { ScreenLayoutTablet } from './screen-layout-tablet'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  return (
    <>
      {toDataTestIds(input).map((dataTestId) => (
        <div key={dataTestId} className='hidden' data-testid={dataTestId} />
      ))}
      <ScreenLayoutVariant {...input} />
    </>
  )
}

const ScreenLayoutVariant = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return <ScreenLayoutMobile {...input} />
    case 'tablet':
      return <ScreenLayoutTablet {...input} />
  }
}
