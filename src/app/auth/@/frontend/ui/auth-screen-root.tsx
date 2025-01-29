import { VDomChildren } from '~/@/vdom/vdom'
import { AuthScreenHeader } from './auth-screen-header'
import { Translator } from '~/@/l18n/generated'

export const AuthScreenLayout = (input: {
  ctx: {
    t: Translator
  }
  children: VDomChildren
}) => {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex h-full w-full max-w-xl flex-col items-center justify-center gap-4 p-6'>
        <AuthScreenHeader ctx={input.ctx} />
        {input.children}
      </div>
    </div>
  )
}
