import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui'
import { VDom } from '~/@/vdom/vdom'
import { NavBarProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export const AuthScreenLayout = (input: {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  children: VDom
  center: boolean
  navBar: NavBarProps | null
}) => {
  return (
    <div className={cn('flex h-full flex-col items-center', input.center ? 'justify-center' : 'justify-start')}>
      <div className='flex w-full max-w-xl flex-col items-center justify-center gap-4 p-6'>{input.children}</div>
    </div>
  )
}
