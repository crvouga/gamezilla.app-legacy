import { VDomChildren } from '~/@/vdom/vdom'
import { ScreenLayoutMobile } from './mobile'
import { ScreenLayoutProps } from './props'
import { ScreenLayoutTablet } from './tablet'
import { cn } from '~/@/ui'

export const ScreenLayout = (input: ScreenLayoutProps) => {
  switch (input.ctx.screenSize) {
    case 'mobile':
      return <ScreenLayoutMobile {...input} />
    case 'tablet':
      return <ScreenLayoutTablet {...input} />
  }
}

export const ScreenBodyRoot = (input: { children: VDomChildren; className?: string }) => {
  return <div className={cn('w-full flex-1', input.className)}>{input.children}</div>
}
