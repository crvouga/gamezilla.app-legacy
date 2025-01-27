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

export const ScreenBodyContent = (input: { children: VDomChildren; className?: string }) => {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 overflow-y-auto p-6',
        input.className,
      )}
    >
      {input.children}
    </div>
  )
}

export const RootLayout = (input: { children: VDomChildren }) => {
  return (
    <div className='fixed left-1/2 top-1/2 flex h-[100dvh] w-screen -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden bg-black text-white'>
      <div className='relative flex h-full max-h-[915px] w-full max-w-[1200px] flex-col items-center justify-center overflow-hidden rounded min-[1200px]:border'>
        {input.children}
      </div>
    </div>
  )
}
