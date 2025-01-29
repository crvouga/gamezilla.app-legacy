import { VDomChildren } from '~/@/vdom/vdom'

export const AuthScreenRootLayout = (input: { children: VDomChildren }) => {
  return (
    <div className='flex items-center justify-center'>
      <div className='flex h-full w-full max-w-xl flex-col items-center justify-center gap-4 p-6'>{input.children}</div>
    </div>
  )
}
