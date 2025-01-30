import { Translator } from '~/@/l18n/generated'
import { cn } from '~/@/ui'
import { VDomChildren } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export const AuthScreenLayout = (input: {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  center?: boolean
  children: VDomChildren
}) => {
  const center = input.center || input.ctx.screenSize === 'tablet'
  const paddingTop = center ? 'pt-36' : ''
  return (
    <div className={cn('flex flex-col items-center justify-center', paddingTop)}>
      <div className='flex w-full max-w-xl flex-col items-center justify-center gap-4 p-6'>{input.children}</div>
    </div>
  )
}
